import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantillaAuth from '../../plantillas/PlantillaAuth';
import CampoEntrada from '../../components/CampoEntrada';
import axiosInstance from '../../api/axios';

// Coincide con RoleType del backend: 1 = Seller, 2 = Customer
const ROL_NUMERO: Record<'Customer' | 'Seller', number> = {
  Seller:   1,
  Customer: 2,
};

export default function Registro() {
  const navegar = useNavigate();

  const [nombre,     setNombre]     = useState('');
  const [correo,     setCorreo]     = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol,        setRol]        = useState<'Customer' | 'Seller'>('Customer');
  const [errores,    setErrores]    = useState<Record<string, string>>({});
  const [cargando,   setCargando]   = useState(false);
  const [errorApi,   setErrorApi]   = useState<string | null>(null);

  const validar = () => {
    const nuevos: Record<string, string> = {};

    if (!nombre.trim())
      nuevos.nombre = 'El nombre es obligatorio';
    else if (nombre.trim().length < 2)
      nuevos.nombre = 'Mínimo 2 caracteres';

    if (!correo.trim())
      nuevos.correo = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
      nuevos.correo = 'Formato de correo inválido';

    if (!contrasena)
      nuevos.contrasena = 'La contraseña es obligatoria';
    else if (contrasena.length < 6)
      nuevos.contrasena = 'Mínimo 6 caracteres';

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    setErrorApi(null);

    try {
      await axiosInstance.post('/Security/register', {
        name:     nombre.trim(),
        email:    correo.trim(),
        password: contrasena,
        role:     ROL_NUMERO[rol],
      });

      // Registro exitoso → redirigir al login
      navegar('/iniciar-sesion');
    } catch (error: any) {
      // El backend devuelve { message } o { errors } según el caso
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        'Error al registrar. Intenta nuevamente.';
      setErrorApi(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <PlantillaAuth>
      {/* Pestañas */}
      <div className="pestanas-auth" role="tablist" aria-label="Tipo de acceso">
        <button
          className="pestana-auth"
          role="tab"
          aria-selected="false"
          type="button"
          onClick={() => navegar('/iniciar-sesion')}
        >
          Iniciar Sesión
        </button>
        <button
          className="pestana-auth activa"
          role="tab"
          aria-selected="true"
          type="button"
        >
          Registro
        </button>
      </div>

      <div className="cabecera-formulario-auth" style={{ textAlign: 'left', marginBottom: 'var(--space-lg)' }}>
        <h2 className="titulo-formulario-auth" style={{ fontSize: '36px', textAlign: 'left' }}>
          Crea tu cuenta
        </h2>
        <p className="descripcion-formulario-auth" style={{ textAlign: 'left' }}>
          Únete a Nexo y comienza a conectar.
        </p>
      </div>

      {/* Error global de API */}
      {errorApi && (
        <div className="error-api" role="alert" style={{ marginBottom: 'var(--space-md)' }}>
          {errorApi}
        </div>
      )}

      {/* Formulario */}
      <form className="formulario-auth" onSubmit={manejarEnvio} noValidate>
        <CampoEntrada
          id="registro-nombre"
          label="Nombre Completo"
          type="text"
          placeholder="Juan Pérez"
          value={nombre}
          onChange={setNombre}
          error={errores.nombre}
          icon="person"
          required
          autoComplete="name"
        />

        <CampoEntrada
          id="registro-correo"
          label="Correo Electrónico"
          type="email"
          placeholder="tu@email.com"
          value={correo}
          onChange={setCorreo}
          error={errores.correo}
          icon="mail"
          required
          autoComplete="email"
        />

        <CampoEntrada
          id="registro-contrasena"
          label="Contraseña"
          type="password"
          placeholder="Min. 6 caracteres"
          value={contrasena}
          onChange={setContrasena}
          error={errores.contrasena}
          icon="lock"
          required
          autoComplete="new-password"
        />

        {/* Selector de rol */}
        <div className="contenedor-campo">
          <span className="etiqueta-campo">Selecciona tu Rol</span>
          <div className="selector-rol">
            <label className="tarjeta-rol">
              <input
                type="radio"
                name="rol"
                value="Customer"
                checked={rol === 'Customer'}
                onChange={() => setRol('Customer')}
              />
              <div className="contenido-tarjeta-rol">
                <div className="icono-tarjeta-rol">
                  <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <div>
                  <p className="nombre-tarjeta-rol">Comprador</p>
                  <p className="descripcion-tarjeta-rol">Explora y compra productos.</p>
                </div>
              </div>
              <span className="material-symbols-outlined marca-seleccion-rol">check_circle</span>
            </label>

            <label className="tarjeta-rol">
              <input
                type="radio"
                name="rol"
                value="Seller"
                checked={rol === 'Seller'}
                onChange={() => setRol('Seller')}
              />
              <div className="contenido-tarjeta-rol">
                <div className="icono-tarjeta-rol">
                  <span className="material-symbols-outlined">storefront</span>
                </div>
                <div>
                  <p className="nombre-tarjeta-rol">Vendedor</p>
                  <p className="descripcion-tarjeta-rol">Gestiona y vende inventario.</p>
                </div>
              </div>
              <span className="material-symbols-outlined marca-seleccion-rol">check_circle</span>
            </label>
          </div>
        </div>

        <button type="submit" className="boton-enviar-auth" disabled={cargando}>
          {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

     
    </PlantillaAuth>
  );
}