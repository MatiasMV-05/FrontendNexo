// @ts-nocheck
import { Link, useNavigate } from 'react-router-dom';
import './styles/Home.css';
import { Helmet } from 'react-helmet-async';
import { MdSecurity, MdLocalShipping, MdInventory2, MdSupportAgent, MdArrowForward } from 'react-icons/md';
import ecommers from '../../assets/E-commers.webp';
import compu from '../../assets/Compu.webp';
import hogar from '../../assets/Hogar.webp';
import vestimenta from '../../assets/Vestimenta.webp';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Inicio - Mi Aplicación</title>
        <meta
          name="description"
          content="Bienvenido a nuestra plataforma de comercio electrónico. Explora nuestro catálogo, descubre productos de calidad y disfruta de una experiencia de compra segura y rápida."
        />
        <meta
          name="keywords"
          content="inicio, e-commerce, catálogo, productos, compras en línea, plataforma de comercio electrónico"
        />
        <meta
          name="author"
          content="Nexo"
        />
        
        {/* Open Graph */}

        <meta
          property="og:title"
          content="Inicio - Mi Aplicación"
        />
        <meta
          property="og:description"
          content="Bienvenido a nuestra plataforma de comercio electrónico. Explora nuestro catálogo, descubre productos de calidad y disfruta de una experiencia de compra segura y rápida."
        />
        <meta
          property="og:image"
          content="src/assets/Oficina.webp"
        />
        <meta
          property="og:type"
          content="website"
        />
      </Helmet>
   
    <div className="home-layout">
      <main>
        {/* Hero Section */}
        <section className="home-hero">
          <div className="home-hero-bg"></div>
          <div className="home-hero-container">
            <div className="home-hero-content">
              <h1 className="home-hero-title">Conecta con lo mejor del e-commerce</h1>
              <p className="home-hero-subtitle">
                Descubre una nueva forma de comprar y vender. Nexo reúne calidad, velocidad y seguridad en una sola plataforma diseñada para ti.
              </p>
              <div className="home-hero-actions">
                <button
                  className="btn-primary-large"
                  onClick={() => navigate('/catalogo')}
                >
                  Explorar Catálogo
                </button>
                <button
                  className="btn-outline-large"
                  onClick={() => navigate('/acerca-de-nosotros')}
                >
                  Conocer Más
                </button>
              </div>
            </div>

            <div className="home-hero-image">
              <img
                src={ecommers}
                alt="E-commerce abstract"
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="home-benefits">
          <div className="home-benefits-container">
            <div className="home-benefits-grid">
              {/* Benefit 1 */}
              <div className="home-benefit-card">
                <div className="home-benefit-icon-wrapper">
                  <MdSecurity />
                </div>
                <h3>Compra Segura</h3>
                <p>Transacciones protegidas con encriptación .</p>
              </div>

              {/* Benefit 2 */}
              <div className="home-benefit-card">
                <div className="home-benefit-icon-wrapper">
                  <MdLocalShipping />
                </div>
                <h3>Entrega Rápida</h3>
                <p>Envíos express en menos de 24 horas a nivel nacional.</p>
              </div>

              {/* Benefit 3 */}
              <div className="home-benefit-card">
                <div className="home-benefit-icon-wrapper">
                  <MdInventory2 />
                </div>
                <h3>Amplio Catálogo</h3>
                <p>Miles de productos verificados de los mejores vendedores.</p>
              </div>

              {/* Benefit 4 */}
              <div className="home-benefit-card">
                <div className="home-benefit-icon-wrapper">
                  <MdSupportAgent />
                </div>
                <h3>Atención al Cliente</h3>
                <p>Soporte 24/7 para resolver tus dudas inmediatamente.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="home-categories">
          <div className="home-categories-container">
            <div className="home-categories-header">
              <h2>Explora Categorías</h2>
              <p>Encuentra exactamente lo que buscas en nuestras categorías principales.</p>
            </div>

            <div className="home-bento-grid">
              {/* Electronics */}
              <div className="home-bento-item home-bento-electronics" onClick={() => navigate('/catalogo')}>
                <img
                  src={compu}
                  alt="Electrónica"
                />
                <div className="home-bento-overlay"></div>
                <div className="home-bento-content">
                  <h3>Electrónica</h3>
                  <div className="home-bento-action">
                    <p>Última tecnología</p>
                    <button className="home-bento-btn">
                      <MdArrowForward />
                    </button>
                  </div>
                </div>
              </div>

              <div className="home-bento-column">
                {/* Home */}
                <div className="home-bento-item home-bento-home" onClick={() => navigate('/catalogo')}>
                  <img
                    src={hogar}
                    alt="Hogar"
                  />
                  <div className="home-bento-overlay-alt"></div>
                  <div className="home-bento-content">
                    <h3>Hogar</h3>
                    <p>Decora tu espacio</p>
                  </div>
                </div>

                {/* Fashion */}
                <div className="home-bento-item home-bento-fashion" onClick={() => navigate('/catalogo')}>
                  <img
                    src={vestimenta}
                    alt="Moda"
                  />
                  <div className="home-bento-overlay-alt"></div>
                  <div className="home-bento-content">
                    <h3>Moda</h3>
                    <p>Tendencias actuales</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="home-cta">
          <div className="home-cta-pattern">
            <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="home-cta-container">
            <h2>Únete a miles de clientes</h2>
            <p>
              Comienza a disfrutar de la mejor experiencia de compra en línea hoy mismo. Registro gratuito y rápido.
            </p>
            <button
              className="btn-cta"
              onClick={() => navigate('/registro')}
            >
              Crear Cuenta
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-container">
          <div className="home-footer-brand">
            <span className="home-footer-logo">Nexo</span>
            <p>
              Tu plataforma de confianza para comprar y vender productos de calidad. Conectando necesidades con soluciones en todo momento.
            </p>
          </div>

          <div className="home-footer-links-group">
            <div className="home-footer-column">
              <h4>Enlaces Rápidos</h4>
              <nav>
                <Link to="/">Inicio</Link>
                <Link to="/catalogo">Catálogo</Link>
                <Link to="/acerca-de-nosotros">Acerca de Nosotros</Link>
              </nav>
            </div>

          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
