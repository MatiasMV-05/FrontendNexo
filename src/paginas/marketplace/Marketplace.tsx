import { useState, useEffect, useMemo } from 'react';
import TopHeader from './components/TopHeader';
import FiltersPanel from './components/FiltersPanel';
import type { Filtros } from './components/FiltersPanel';
import ProductGrid from './components/ProductGrid';
import AddToCartModal from './components/AddToCartModal';
import { productService } from '../../api/products';
import { cartService } from '../../api/cart';
import type { ProductDto } from '../../types/Producto';
import './styles/Marketplace.css';

export default function Marketplace() {
  const [allProducts, setAllProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recomendado');

  const [filtros, setFiltros] = useState<Filtros>({
    categorias: [],
    precioMin: '',
    precioMax: '',
    soloEnStock: false,
  });

  // Load all products once
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts({ pageNumber: 1, pageSize: 100 });
      setAllProducts(response.data ?? []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('No se pudieron cargar los productos. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  // Apply filters locally (fast, no extra API calls needed for this product set)
  const productosFiltrados = useMemo(() => {
    let result = allProducts.filter(p => {
      // Search text
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(query) ?? false;
        const matchesDesc = p.description?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesDesc) return false;
      }

      // Category filter
      if (filtros.categorias.length > 0) {
        const match = filtros.categorias.some(
          cat => p.category?.toLowerCase() === cat.toLowerCase()
        );
        if (!match) return false;
      }

      // Price min
      if (filtros.precioMin !== '' && p.price < filtros.precioMin) return false;

      // Price max
      if (filtros.precioMax !== '' && p.price > filtros.precioMax) return false;

      // Stock filter
      if (filtros.soloEnStock && p.stock === 0) return false;

      return true;
    });

    // Sorting
    if (sortOption === 'menor_mayor') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'mayor_menor') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allProducts, filtros, searchQuery, sortOption]);

  const handleOpenModal = (product: ProductDto) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirmAddToCart = async (product: ProductDto, quantity: number) => {
    try {
      setAddingToCartId(product.id!);
      await cartService.addItemToCart(product.id!, quantity);
      alert(`"${product.name}" (x${quantity}) añadido al carrito`);
      setIsModalOpen(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.messages?.[0]?.description ||
        err.response?.data?.data ||
        'Error al añadir al carrito';
      alert(`Error: ${msg}`);
    } finally {
      setAddingToCartId(null);
    }
  };

  return (
    <div className="marketplace-layout">

      <div className="marketplace-main-content">
        <TopHeader onSearch={setSearchQuery} />

        <main className="marketplace-container">
          <FiltersPanel onFiltrosChange={setFiltros} />

          <ProductGrid
            products={productosFiltrados}
            loading={loading}
            error={error}
            onAddToCart={handleOpenModal}
            addingToCartId={addingToCartId}
            onSortChange={setSortOption}
          />
        </main>
      </div>

      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAddToCart}
        product={selectedProduct}
      />
    </div>
  );
}
