// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PlantillaAuth from './PlantillaAuth';
import CampoEntrada from '../../components/CampoEntrada';
import { Helmet } from 'react-helmet-async';
import { MdError, MdRefresh, MdArrowForward } from 'react-icons/md';

const IniciarSesion: React.FC = () => {
  const navegar = useNavigate();
  const { iniciarSesion } = useAuth();

  const [correo, setCorreo]         = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [errores, setErrores]       = useState<Record<string, string>>({});
  const [cargando, setCargando]     = useState(false);

  const validar = () => {
    const nuevos: Record<string, string> = {};

    if (!correo.trim()) {
      nuevos.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      nuevos.correo = 'Formato de correo inválido';
    }

    if (!contrasena) {
      nuevos.contrasena = 'La contraseña es obligatoria';
    } else if (contrasena.length < 6) {
      nuevos.contrasena = 'Mínimo 6 caracteres';
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    
    setError(null);
    setCargando(true);
    try {
      const user = await iniciarSesion({ email: correo, password: contrasena });
      if (user.rol === 'Administrator') {
        navegar('/panel-control');
      } else if (user.rol === 'Seller') {
        navegar('/mis-ventas');
      } else {
        navegar('/marketplace');
      }
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Credenciales no válidas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <PlantillaAuth>
      <div>
        <Helmet>
          <title>
            Iniciar Sesión - Mi Aplicación
          </title>

          <meta 
            name="description"
            content="Inicia sesión en tu cuenta para acceder a todas las funcionalidades de nuestra aplicación."
          />
          <meta
            name="keywords"
            content="iniciar sesión, login, autenticación, acceso, cuenta"
          />
          <meta
            name="author"
            content="Nombre del Autor o Empresa"
          />
        </Helmet>
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
          <MdError style={{ fontSize: 18 }} />
          {error}
        </div>
      )}

      {/* Formulario */}
      <form className="formulario-auth" onSubmit={manejarEnvio} noValidate>
        <div>
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
          {errores.correo && <span style={{ color: '#ba1a1a', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errores.correo}</span>}
        </div>

        <div>
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
          {errores.contrasena && <span style={{ color: '#ba1a1a', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errores.contrasena}</span>}
        </div>

        <button
          type="submit"
          className="boton-enviar-auth"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <MdRefresh style={{ fontSize: 18, animation: 'spin 1s linear infinite' }} />
              Iniciando...
            </>
          ) : (
            <>
              Iniciar Sesión
              <MdArrowForward style={{ fontSize: 18 }} />
            </>
          )}
        </button>
      </form>
      </div>
    </PlantillaAuth>
  );
};

export default IniciarSesion;