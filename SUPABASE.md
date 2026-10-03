# Guía General de Configuración de Backend en Supabase

Esta guía proporciona un marco metodológico y técnico para que cualquier equipo o desarrollador configure su propio proyecto de backend en **Supabase** de forma segura, estructurada y escalable.

> [!TIP]
> Se incluye un script de esquema inicial listo para usar en [`supabase/schema.sql`](./supabase/schema.sql) que implementa las tablas, índices, triggers y políticas RLS descritas en esta arquitectura.

---

## 1. Análisis y Modelado de Datos

Antes de crear cualquier recurso en Supabase, la persona responsable del proyecto debe analizar y definir los requisitos de su aplicación:

1. **Identificación de entidades**: Determinar qué tablas requerirá el sistema según el dominio de la aplicación.
2. **Definición de atributos**: Establecer qué información almacenará cada tabla, asignando tipos de datos adecuados (`UUID`, `TEXT`, `NUMERIC`, `TIMESTAMPTZ`, `BOOLEAN`, etc.) y restricciones de integridad (`NOT NULL`, `CHECK`, `UNIQUE`).
3. **Relaciones entre tablas**: Identificar las claves primarias (`PRIMARY KEY`) y claves foráneas (`FOREIGN KEY`) para conectar entidades (por ejemplo, relacionar tablas principales con `auth.users` mediante `REFERENCES auth.users(id)`).
4. **Definición de permisos por rol**: Establecer con claridad qué operaciones (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) podrá realizar cada tipo de usuario (anónimo, autenticado o administrador).

### Estructura de Creación Genérica (DDL)

```sql
-- Creación de una tabla genérica con restricciones e integridad referencial
CREATE TABLE IF NOT EXISTS public.[nombre_de_tabla] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    [campo_texto] TEXT NOT NULL,
    [campo_numerico] NUMERIC DEFAULT 0 CHECK ([campo_numerico] >= 0),
    [campo_estado] TEXT NOT NULL DEFAULT '[estado_inicial]',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Creación de índices para campos consultados frecuentemente
CREATE INDEX IF NOT EXISTS idx_[nombre_de_tabla]_[campo_busqueda] 
ON public.[nombre_de_tabla]([campo_busqueda]);
```

---

## 2. Seguridad con Row Level Security (RLS) y Políticas de Acceso

Por defecto, PostgreSQL permite el acceso completo a las tablas si no se configuran restricciones. Para garantizar el aislamiento de la información, se debe habilitar **Row Level Security (RLS)** en todas las tablas del esquema público.

### A. Habilitación de RLS

```sql
ALTER TABLE public.[nombre_de_tabla] ENABLE ROW LEVEL SECURITY;
```

### B. Principio de Menor Privilegio

No se debe permitir el acceso público o indiscriminado a los datos sin una justificación clara. Cada política debe ser explícita y restringir las acciones al usuario propietario o autorizado:

```sql
-- 1. Política de Lectura (SELECT)
CREATE POLICY "Permitir lectura a usuarios autorizados"
    ON public.[nombre_de_tabla] FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 2. Política de Creación (INSERT)
CREATE POLICY "Permitir inserción al usuario autenticado"
    ON public.[nombre_de_tabla] FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3. Política de Modificación (UPDATE)
CREATE POLICY "Permitir actualización al propietario del registro"
    ON public.[nombre_de_tabla] FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Política de Eliminación (DELETE)
CREATE POLICY "Permitir eliminación al propietario del registro"
    ON public.[nombre_de_tabla] FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
```

> [!WARNING]
> Cada equipo debe auditar sus políticas de RLS antes de pasar a producción. Una política mal configurada o excesivamente permisiva puede exponer información sensible a usuarios no autorizados.

---

## 3. Funciones y Triggers en Base de Datos

### ¿Qué son y cuándo utilizarlos?

- **Funciones PL/pgSQL**: Bloques de lógica que se ejecutan directamente en el motor de la base de datos para realizar cálculos complejos, validaciones o mutaciones multi-tabla con consistencia transaccional.
- **Triggers (Disparadores)**: Mecanismos que ejecutan automáticamente una función en respuesta a un evento específico (`BEFORE` o `AFTER` de un `INSERT`, `UPDATE` o `DELETE`) en una tabla determinada.

### Criterios para decidir si el proyecto requiere Triggers

Un proyecto puede requerir triggers si necesita:
- Automatizar la creación de registros dependientes cuando se genera un registro principal.
- Inicializar perfiles de usuario inmediatamente después de un registro en `auth.users`.
- Mantener campos de auditoría o sincronizar contadores de forma atómica.

### Definición Requerida antes de Implementar un Trigger:
1. **Tabla afectada**: Tabla sobre la que se escuchará el evento.
2. **Evento detonador**: `INSERT`, `UPDATE` o `DELETE` (`BEFORE` o `AFTER`).
3. **Función a ejecutar**: Rutina PL/pgSQL que procesará el registro nuevo (`NEW`) o anterior (`OLD`).
4. **Resultado esperado**: Efecto que debe ocurrir en la base de datos tras la ejecución.

### Estructura Genérica de Función y Trigger

```sql
-- Definición de la función
CREATE OR REPLACE FUNCTION public.[nombre_de_funcion]()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Lógica personalizada de la función
    INSERT INTO public.[tabla_destino] ([columna_referencia], [columna_detalle])
    VALUES (NEW.id, '[valor_predeterminado]');

    RETURN NEW;
END;
$$;

-- Vinculación del Trigger a la tabla origen
DROP TRIGGER IF EXISTS [nombre_del_trigger] ON public.[tabla_origen];
CREATE TRIGGER [nombre_del_trigger]
    AFTER INSERT ON public.[tabla_origen]
    FOR EACH ROW EXECUTE FUNCTION public.[nombre_de_funcion]();

-- Restricción de permisos de ejecución directa por seguridad
REVOKE EXECUTE ON FUNCTION public.[nombre_de_funcion]() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.[nombre_de_funcion]() FROM anon, authenticated;
```

> [!NOTE]
> Las funciones declaradas con `SECURITY DEFINER` se ejecutan con los privilegios del creador de la función. Es fundamental establecer explícitamente `SET search_path = public` para prevenir vulnerabilidades de secuestro de ruta de búsqueda.

---

## 4. Configuración de Autenticación (Auth)

Supabase Auth gestiona el registro, inicio de sesión y emisión de tokens JWT. Cada proyecto debe configurar únicamente los métodos y parámetros que vaya a utilizar:

1. **Proveedores de autenticación**:
   - Activar únicamente los proveedores requeridos (por ejemplo, correo electrónico con contraseña, código OTP de un solo uso, Magic Links o proveedores OAuth como Google/GitHub).
2. **Plantillas y remitentes de correo**:
   - Cada proyecto debe personalizar los asuntos, mensajes y plantillas de correo electrónico desde la consola de administración de Supabase, adaptándolos a su identidad de marca y preferencias.
3. **Configuración de URLs**:
   - **Site URL**: Especificar la URL principal de la aplicación (`http://localhost:5173` en desarrollo local o la URL del dominio en producción).
   - **Redirect URLs**: Registrar las rutas permitidas para el retorno tras la autenticación o verificación de códigos.

---

## 5. Servicios y Extensiones Opcionales

Dependiendo de los requerimientos de la aplicación, el equipo puede evaluar y activar servicios adicionales:

- **Supabase Storage**: Para proyectos que requieran subida y almacenamiento de archivos (imágenes, documentos, videos). Requiere definir si el bucket será público o privado y crear políticas de acceso en `storage.objects`.
- **Realtime**: Para aplicaciones que necesiten reflejar cambios instantáneos en la interfaz mediante WebSockets sobre tablas específicas.
- **Edge Functions**: Para ejecutar lógica backend en TypeScript en el borde (Edge) sin administrar servidores dedicados.
- **Extensiones de PostgreSQL**: Herramientas adicionales como `pg_crypto`, `uuid-ossp` o `pgvector` según las necesidades técnicas del proyecto.

---

## 6. Variables de Entorno y Conexión con el Frontend

Para comunicar cualquier cliente o frontend con el proyecto de Supabase, se requieren dos variables de entorno principales:

```env
VITE_SUPABASE_URL=https://[id_del_proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=[clave_anonima_publica]
```

> [!CAUTION]
> - La clave `anon` es pública y segura para ser utilizada en el cliente web siempre que **RLS esté correctamente activado y configurado**.
> - La clave `service_role` posee permisos de superusuario que omiten RLS por completo. **Nunca** debe exponerse en el código cliente ni subirse a repositorios públicos.

---

## 7. Pruebas de Verificación del Backend

Antes de conectar la interfaz de usuario en producción, se recomienda realizar las siguientes pruebas de verificación:

1. **Prueba de Conectividad**: Comprobar que el cliente pueda inicializarse y resolver consultas básicas contra la URL del proyecto.
2. **Prueba de Flujo de Autenticación**: Registrar un usuario de prueba mediante el método configurado (OTP, correo/contraseña u OAuth) y verificar que se genere la sesión y el token JWT correspondiente.
3. **Prueba de Políticas RLS**:
   - Intentar consultar o modificar registros pertenecientes a otro usuario con una sesión autenticada; la base de datos debe rechazar la operación devolviendo una lista vacía o un error de permiso.
   - Intentar realizar operaciones no autenticadas (`anon`) sobre tablas protegidas; deben ser bloqueadas.
4. **Prueba de Triggers**: Insertar un registro en la tabla origen y verificar que la tabla destino refleje los cambios automáticos esperados.

---

## 8. Lista de Verificación (Checklist) Pre-Lanzamiento

- [ ] Todas las tablas del esquema `public` tienen **RLS habilitado**.
- [ ] Existen políticas RLS explícitas para `SELECT`, `INSERT`, `UPDATE` y `DELETE`.
- [ ] No se utiliza ni se expone la clave `service_role` en el código frontend.
- [ ] Las funciones `SECURITY DEFINER` tienen fijado su `search_path`.
- [ ] Las URLs de redirección en Authentication están limitadas únicamente a los dominios autorizados.
- [ ] Se han configurado los límites de tamaño y tipos MIME en los buckets de Storage que lo requieran.
- [ ] Los índices de base de datos están creados para las columnas utilizadas en filtros y relaciones frecuentes.
