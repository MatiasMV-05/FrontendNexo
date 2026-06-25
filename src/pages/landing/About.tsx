// @ts-nocheck
import { Link, useLocation } from 'react-router-dom';
import './styles/Home.css'; // Reusing Home styles for header/footer
import './styles/About.css'; // Specific styles for About page
import { Helmet } from 'react-helmet-async';
import { MdRocketLaunch, MdVisibility } from 'react-icons/md';

export default function About() {
  const location = useLocation();
  const isApp = location.pathname.includes('/app/acerca-de-nosotros');

  return (
    <div>
      <Helmet>
        <title>Acerca de Nosotros - Mi Aplicación</title>
        <meta
          name="description"
          content="Conoce nuestra misión, visión y el equipo detrás de nuestra plataforma de comercio electrónico."
        />
        
        <meta
          name="keywords"
          content="Acerca de Nosotros, Misión, Visión, Equipo, Comercio Electrónico, Plataforma"
        />

        <meta 
          name="author"
          content="Nexo"
        />

        {/* Open Graph */}

        <meta
          property="og:title"
          content="Acerca de Nosotros - Mi Aplicación"
        />
        <meta
          property="og:description"
          content="Conoce nuestra misión, visión y el equipo detrás de nuestra plataforma de comercio electrónico."
        />
        <meta
          property="og:image"
          content="/src/assets/Oficina.jpg"
        />
        <meta
          property="og:type"
          content="website"
        />
          
      </Helmet>
    <div className={isApp ? "" : "home-layout"}>
      <main className="about-main">
        {/* Hero Section */}
        <section className="about-hero">
          <h1 className="about-hero-title">Acerca de Nosotros</h1>
          <p className="about-hero-subtitle">
            Impulsando el futuro del comercio digital mediante soluciones tecnológicas innovadoras, conectando personas y negocios de forma inteligente.
          </p>

          <div className="about-hero-image-container nexo-shadow border-primary">
            <img
              src="../../assets/Oficina.jpg"
              alt="Corporate office environment"
              className="about-hero-image"
            />
          </div>
        </section>

        {/* Mission & Vision Bento Grid */}
        <section className="about-bento-section">
          <div className="about-bento-grid">
            {/* Mission */}
            <div className="about-card nexo-shadow border-secondary group">
              <div className="about-card-icon">
                <MdRocketLaunch className="text-secondary" size={32} />
              </div>
              <h3 className="about-card-title">Nuestra Misión</h3>
              <p className="about-card-text">
                Democratizar el acceso al comercio electrónico avanzado, proporcionando herramientas intuitivas y potentes que permitan a cualquier empresa escalar sus operaciones globales con eficiencia y seguridad.
              </p>
            </div>

            {/* Vision */}
            <div className="about-card nexo-shadow border-primary group">
              <div className="about-card-icon">
                <MdVisibility className="text-primary" size={32} />
              </div>
              <h3 className="about-card-title">Nuestra Visión</h3>
              <p className="about-card-text">
                Ser el estándar global en plataformas de e-commerce, reconocidos por nuestra capacidad de innovación, robustez técnica y compromiso inquebrantable con el éxito de nuestros clientes.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      {!isApp && (
        <footer className="home-footer">
          <div className="home-footer-container">

            <div className="home-footer-links-group">
              <div className="home-footer-column">
                <nav>
                  <Link to="/">Inicio</Link>
                  <Link to="/catalogo">Catálogo</Link>
                  <Link to="/acerca-de-nosotros">Acerca de Nosotros</Link>
                </nav>
              </div>

              <div className="home-footer-column">
                <nav>
                  <Link to="#">Contacto</Link>
                  <Link to="#">Términos y Condiciones</Link>
                  <Link to="#">Privacidad</Link>
                </nav>
              </div>
            </div>
          </div>
        </footer>
      )}
      </div>
    </div>
  );
}
