import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FiltersPanel from './components/FiltersPanel';
import type { Filtros } from './components/FiltersPanel';
import ProductGrid from './components/ProductGrid';
import AddToCartModal from './components/AddToCartModal';
import { productService } from '../../services/products';
import { cartService } from '../../services/cart';
import { useAuth } from '../../contexts/AuthContext';
import type { ProductDto } from '../../types/Producto';
import { useNotification } from '../../contexts/NotificationContext';
import './styles/Marketplace.css';
import { Helmet } from 'react-helmet-async';

export default function Marketplace() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotification();
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
    // If not authenticated, redirect to registration
    if (!usuario) {
      navigate('/registro');
      return;
    }
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirmAddToCart = async (product: ProductDto, quantity: number) => {
    try {
      setAddingToCartId(product.id!);
      await cartService.addItemToCart(product.id!, quantity);
      mostrarNotificacion(`"${product.name}" (x${quantity}) añadido al carrito`, 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.messages?.[0]?.description ||
        err.response?.data?.data ||
        'Error al añadir al carrito';
      mostrarNotificacion(`Error: ${msg}`, 'error');
    } finally {
      setAddingToCartId(null);
    }
  };

  return (   
    <div> 
      <Helmet>
        <title>Marketplace - Mi Aplicación</title>
        <meta
          name="description"
          content="Explora nuestro marketplace con una amplia variedad de productos. Filtra por categoría, precio y disponibilidad para encontrar exactamente lo que buscas."
        />
        <meta
          name="keywords"
          content="marketplace, productos, e-commerce, comprar, vender, catálogo, filtrado"
        />
        <meta
          name="author"
          content="Nexo"
        />
        
        {/* Open Graph */}

        <meta
          property="og:title"
          content="Marketplace - Mi Aplicación"
        />
        <meta
          property="og:description"
          content="Explora nuestro marketplace con una amplia variedad de productos. Filtra por categoría, precio y disponibilidad para encontrar exactamente lo que buscas."
        />
        <meta
          property="og:type"
          content="website"
        />
      </Helmet>
      <div className="marketplace-layout">

      <div className="marketplace-main-content">
        <main className="marketplace-container">
          <FiltersPanel onFiltrosChange={setFiltros} onSearch={setSearchQuery} />

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
    </div>
  );
}
