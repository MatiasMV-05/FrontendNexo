// @ts-nocheck
import { useState } from 'react';
import { MdError, MdMail, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const IconMap: Record<string, React.ElementType> = {
  mail: MdMail,
  lock: MdLock,
  person: MdPerson,
};

interface PropiedadesCampoEntrada {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (valor: string) => void;
  error?: string;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export default function CampoEntrada({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  required = false,
  disabled = false,
  autoComplete,
}: PropiedadesCampoEntrada) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const esContrasena = type === 'password';
  const tipoInput = esContrasena ? (mostrarContrasena ? 'text' : 'password') : type;

  const clasesEnvoltorio = [
    'envoltorio-campo',
    error    ? 'campo-error'         : '',
    disabled ? 'campo-deshabilitado' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="contenedor-campo">
      <label htmlFor={id} className="etiqueta-campo">
        {label}
        {required && (
          <span className="requerido-campo" aria-hidden="true">*</span>
        )}
      </label>

      <div className={clasesEnvoltorio}>
        {icon && IconMap[icon] && (
          <div className="icono-campo" aria-hidden="true">
            {(() => {
              const IconComponent = IconMap[icon];
              return <IconComponent />;
            })()}
          </div>
        )}

        <input
          id={id}
          type={tipoInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className="entrada-campo"
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={error ? true : undefined}
        />

        {esContrasena && (
          <button
            type="button"
            className="boton-alternar-campo"
            onClick={() => setMostrarContrasena((v) => !v)}
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mostrarContrasena ? <MdVisibility /> : <MdVisibilityOff />}
            </span>
          </button>
        )}
      </div>

      {error && (
        <span
          id={`${id}-error`}
          className="mensaje-error-campo"
          role="alert"
        >
          <MdError style={{ fontSize: 14 }} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}