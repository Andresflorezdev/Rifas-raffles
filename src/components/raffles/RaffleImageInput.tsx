import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface RaffleImageInputProps {
  label?: string;
  hint?: string;
  currentImageUrl?: string | null;
  selectedFile: File | null;
  onChange: (file: File | null, clearedCurrent?: boolean) => void;
}

export function RaffleImageInput({
  label = 'Imagen del premio',
  hint = 'opcional · JPG, PNG o WEBP',
  currentImageUrl,
  selectedFile,
  onChange,
}: RaffleImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(null);
      };
    } else {
      setObjectUrl(null);
    }
  }, [selectedFile]);

  const activePreviewUrl = objectUrl || currentImageUrl || null;

  const handleFileChange = (file: File | null) => {
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null, true);
  };

  return (
    <div className="image-upload-field">
      {label && (
        <span className="field-label">
          {label} {hint && <span className="label-hint">{hint}</span>}
        </span>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="visually-hidden-input"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          handleFileChange(file);
        }}
      />

      {activePreviewUrl ? (
        <div className="image-preview-card">
          <div className="image-preview-thumb">
            <img src={activePreviewUrl} alt="Vista previa del premio" />
          </div>
          <div className="image-preview-info">
            <span className="image-preview-badge">
              {selectedFile ? 'Nueva imagen' : 'Imagen actual'}
            </span>
            <p
              className="image-preview-name"
              title={selectedFile ? selectedFile.name : 'Imagen guardada'}
            >
              {selectedFile ? selectedFile.name : 'Imagen guardada'}
            </p>
            {selectedFile && (
              <span className="image-preview-size">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </span>
            )}
          </div>
          <div className="image-preview-actions">
            <button
              type="button"
              className="image-action-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar imagen"
            >
              <RefreshCw size={14} />
              <span>Cambiar</span>
            </button>
            <button
              type="button"
              className="image-action-btn remove"
              onClick={handleRemove}
              title="Quitar imagen"
            >
              <Trash2 size={14} />
              <span>Quitar</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className="image-upload-box"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="upload-box-icon">
            <ImagePlus size={20} />
          </div>
          <div className="upload-box-text">
            <span className="upload-main-text">
              Seleccionar imagen del premio
            </span>
            <span className="upload-sub-text">
              Haz clic para elegir un archivo JPG, PNG o WEBP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
