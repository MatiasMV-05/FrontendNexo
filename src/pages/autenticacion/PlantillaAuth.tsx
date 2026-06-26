// @ts-nocheck
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { MdShield, MdHub, MdSupportAgent, MdArrowBack } from 'react-icons/md';
import fondoDecorativo from '../../assets/color-turquesa-y-degradado-azul-abstracto-suave-refrescante-fondo-de-pantalla-para-diseño-móvil-inclinado-249541116.webp';

interface PropiedadesPlantillaAuth {
  children: ReactNode;
}

export default function PlantillaAuth({ children }: PropiedadesPlantillaAuth) {
  const navigate = useNavigate();

  return (
    <div className="pagina-auth">

      {/* PANEL IZQUIERDO — Marca */}
      <aside className="panel-marca" aria-hidden="true">

        {/* Imagen de fondo o patrón de puntos */}
       
          <img
            src={fondoDecorativo}
            alt="Imagen decorativa"
            className="patron-marca"
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              opacity: 0.35,
            }}
          />
          <svg className="patron-marca" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <pattern id="puntos" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="#ffffff" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#puntos)" />
          </svg>
        

        {/* Logo y cabecera */}
        <div className="cabecera-marca">
          <div className="contenedor-logo-marca">
            <div
              className="logo-marca"
              style={{
                background: 'linear-gradient(135deg, var(--custom-violet), var(--custom-teal))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
              }}
            >
              N
            </div>
          </div>
          
          <h1 className="titulo-marca">Bienvenido a Nexo</h1>
          <p className="subtitulo-marca">
            El enlace entre compradores y vendedores. Conectamos lo que necesitas
            en un ecosistema moderno y seguro.
          </p>
        </div>
        <br />

        {/* Insignias flotantes */}
        <div className="contenedor-insignias">
          <div className="insignia">
            <div className="icono-insignia">
              <MdShield style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <div>
              <div className="titulo-insignia">Pagos Seguros</div>
              <p className="texto-insignia">Transacciones protegidas de extremo a extremo.</p>
            </div>
          </div>

          <div className="insignia">
            <div className="icono-insignia">
              <MdHub style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <div>
              <div className="titulo-insignia">Conexión Directa</div>
              <p className="texto-insignia">Comunicación sin intermediarios con vendedores.</p>
            </div>
          </div>

          <div className="insignia">
            <div className="icono-insignia">
              <MdSupportAgent style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <div>
              <div className="titulo-insignia">Soporte 24/7</div>
              <p className="texto-insignia">Asistencia técnica siempre disponible.</p>
            </div>
          </div>

          {/* Líneas de conexión */}
          <svg className="lineas-insignias" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 40 40 Q 150 100 200 150 T 60 250"
              fill="transparent"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
        </div>
      </aside>

      {/* PANEL DERECHO — Formulario */}
      <main className="panel-formulario" style={{ position: 'relative' }}>


        {/* Logo móvil */}
        <div className="logo-movil" style={{ marginTop: '24px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--custom-violet), var(--custom-teal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            N
          </div>
          <span className="texto-logo-movil">Nexo</span>
        </div>

        <div className="contenedor-formulario-auth">
          {children}
        </div>
      </main>
    </div>
  );
}