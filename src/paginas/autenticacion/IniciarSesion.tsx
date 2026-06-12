import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PlantillaAuth from '../../plantillas/PlantillaAuth';
import CampoEntrada from '../../components/CampoEntrada';

const IniciarSesion: React.FC = () => {
  const navegar = useNavigate();
  const { iniciarSesion } = useAuth();

  const [correo, setCorreo]         = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [cargando, setCargando]     = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await iniciarSesion({ email: correo, password: contrasena });
      navegar('/marketplace');
    } catch (err: any) {
      setError(err.message || 'Credenciales no válidas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <PlantillaAuth>
      <div className="cabecera-formulario-auth">
        <h2 className="titulo-formulario-auth">Bienvenido de nuevo</h2>
        <p className="descripcion-formulario-auth">
          Ingresa tus credenciales para continuar.
        </p>
      </div>

      {/* Pestañas */}
      <div className="pestanas-auth" role="tablist" aria-label="Tipo de acceso">
        <button
          className="pestana-auth activa"
          role="tab"
          aria-selected="true"
          type="button"
        >
          Iniciar Sesión
        </button>
        <button
          className="pestana-auth"
          role="tab"
          aria-selected="false"
          type="button"
          onClick={() => navegar('/registro')}
        >
          Registrarse
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alerta-error-auth" role="alert">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            error
          </span>
          {error}
        </div>
      )}

      {/* Formulario */}
      <form className="formulario-auth" onSubmit={manejarEnvio} noValidate>
        <CampoEntrada
          id="login-correo"
          label="Correo Electrónico"
          type="email"
          placeholder="tu@email.com"
          value={correo}
          onChange={setCorreo}
          icon="mail"
          required
          autoComplete="email"
        />

        <CampoEntrada
          id="login-contrasena"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={contrasena}
          onChange={setContrasena}
          icon="lock"
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="boton-enviar-auth"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}
              >
                progress_activity
              </span>
              Iniciando...
            </>
          ) : (
            <>
              Iniciar Sesión
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                arrow_forward
              </span>
            </>
          )}
        </button>
      </form>
    </PlantillaAuth>
  );
};

export default IniciarSesion;