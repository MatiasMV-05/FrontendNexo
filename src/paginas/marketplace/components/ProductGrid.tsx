import React from 'react';
import ProductCard from './ProductCard';
import '../styles/ProductGrid.css';
import type { ProductDto } from '../../../types/Producto';

interface ProductGridProps {
  products: ProductDto[];
  loading: boolean;
  error: string | null;
  onAddToCart: (product: ProductDto) => void;
  addingToCartId: number | null;
  onSortChange?: (sortOption: string) => void;
}

export default function ProductGrid({ products, loading, error, onAddToCart, addingToCartId, onSortChange }: ProductGridProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayProducts = products.slice(startIndex, endIndex);

  // Reset to page 1 when products change (e.g. filter applied)
  React.useEffect(() => { setCurrentPage(1); }, [products.length]);

  return (
    <section className="marketplace-grid-section">
      {/* Grid Header */}
      <div className="marketplace-grid-header">
        <div>
          <h1 className="marketplace-grid-title">Marketplace</h1>
          <p className="marketplace-grid-subtitle">
            {loading
              ? 'Cargando productos...'
              : `Mostrando ${totalItems > 0 ? startIndex + 1 : 0}–${Math.min(endIndex, totalItems)} de ${totalItems} productos`}
          </p>
        </div>

        <div className="marketplace-grid-sort">
          <span className="marketplace-grid-sort-label">Ordenar por:</span>
          <select className="marketplace-grid-sort-select" onChange={(e) => onSortChange?.(e.target.value)}>
            <option value="recomendado">Recomendado</option>
            <option value="menor_mayor">Precio: Menor a Mayor</option>
            <option value="mayor_menor">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '20px', backgroundColor: '#ffdad6', color: '#93000a', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="marketplace-grid-container">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="marketplace-card-skeleton" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#777587', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c7c4d8' }}>search_off</span>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>No se encontraron productos</p>
          <p style={{ fontSize: '14px' }}>Intenta cambiar los filtros seleccionados.</p>
        </div>
      )}

      {/* Products */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="marketplace-grid-container">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                isAdding={addingToCartId === product.id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="marketplace-grid-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="marketplace-pagination-btn"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`marketplace-pagination-btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="marketplace-pagination-btn"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
