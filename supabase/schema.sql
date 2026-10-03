-- ==============================================================================
-- SCHEMA INICIAL - PLATAFORMA DE RIFAS & RAFFLES
-- Compatible con Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. TABLA: public.perfiles
-- Vinculada directamente al usuario autenticado (auth.users)
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    telefono TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: public.rifas
-- Almacena la información principal de cada sorteo creado por un usuario
CREATE TABLE IF NOT EXISTS public.rifas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    cantidad_numeros INT4 NOT NULL CHECK (cantidad_numeros > 0),
    precio_numero NUMERIC NOT NULL CHECK (precio_numero >= 0),
    fecha_sorteo DATE,
    estado TEXT DEFAULT 'activa' NOT NULL CHECK (estado IN ('activa', 'pausada', 'finalizada', 'cancelada', 'archivada')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    notas TEXT
);

-- 3. TABLA: public.numeros
-- Almacena los números y el estado de compra/apartado de cada rifa
CREATE TABLE IF NOT EXISTS public.numeros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rifa_id UUID REFERENCES public.rifas(id) ON DELETE CASCADE,
    numero INT4 NOT NULL,
    estado TEXT DEFAULT 'disponible' NOT NULL CHECK (estado IN ('disponible', 'apartado', 'pagado')),
    comprador_nombre TEXT,
    comprador_telefono TEXT,
    notas TEXT,
    fecha_apartado TIMESTAMPTZ,
    fecha_pago TIMESTAMPTZ,
    CONSTRAINT unique_numero_por_rifa UNIQUE (rifa_id, numero)
);

-- 4. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_rifas_user_id ON public.rifas(user_id);
CREATE INDEX IF NOT EXISTS idx_numeros_rifa_id ON public.numeros(rifa_id);
CREATE INDEX IF NOT EXISTS idx_numeros_estado ON public.numeros(estado);

-- ==============================================================================
-- 5. FUNCIONES Y TRIGGERS AUTOMATIZADOS
-- ==============================================================================

-- A. Trigger: Creación automática de perfil al registrarse el usuario en auth.users
CREATE OR REPLACE FUNCTION public.crear_perfil_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.perfiles (id, nombre, telefono)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'nombre', 'Usuario'),
        NULL
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_crear_perfil ON auth.users;
CREATE TRIGGER trigger_crear_perfil
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.crear_perfil_usuario();

REVOKE EXECUTE ON FUNCTION public.crear_perfil_usuario() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.crear_perfil_usuario() FROM anon, authenticated;

-- B. Trigger: Generación automática de números (1 a N) al crear una rifa
CREATE OR REPLACE FUNCTION public.generar_numeros_rifa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.numeros (rifa_id, numero, estado)
    SELECT
        NEW.id,
        s.num,
        'disponible'
    FROM generate_series(1, NEW.cantidad_numeros) AS s(num);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generar_numeros ON public.rifas;
CREATE TRIGGER trigger_generar_numeros
    AFTER INSERT ON public.rifas
    FOR EACH ROW EXECUTE FUNCTION public.generar_numeros_rifa();

-- ==============================================================================
-- 6. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numeros ENABLE ROW LEVEL SECURITY;

-- Políticas para PERFILES (Lectura y Actualización propia)
CREATE POLICY "perfiles_select_own"
    ON public.perfiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "perfiles_update_own"
    ON public.perfiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Políticas para RIFAS (CRUD exclusivo del propietario)
CREATE POLICY "rifas_select_own"
    ON public.rifas FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "rifas_insert_own"
    ON public.rifas FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rifas_update_own"
    ON public.rifas FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rifas_delete_own"
    ON public.rifas FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Políticas para NÚMEROS (Heredadas de la propiedad de la rifa)
CREATE POLICY "numeros_select_own_raffle"
    ON public.numeros FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.rifas
            WHERE public.rifas.id = public.numeros.rifa_id
            AND public.rifas.user_id = auth.uid()
        )
    );

CREATE POLICY "numeros_update_own_raffle"
    ON public.numeros FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.rifas
            WHERE public.rifas.id = public.numeros.rifa_id
            AND public.rifas.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rifas
            WHERE public.rifas.id = public.numeros.rifa_id
            AND public.rifas.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 7. CONFIGURACIÓN DE STORAGE (OPCIONAL)
-- Bucket para imágenes de premios
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('rifas-imagenes', 'rifas-imagenes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_public_select_rifas_imagenes"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'rifas-imagenes');

CREATE POLICY "storage_authenticated_insert_rifas_imagenes"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'rifas-imagenes');

CREATE POLICY "storage_authenticated_update_rifas_imagenes"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'rifas-imagenes');

CREATE POLICY "storage_authenticated_delete_rifas_imagenes"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'rifas-imagenes');
