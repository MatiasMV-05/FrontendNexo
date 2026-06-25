// @ts-nocheck
import { useState } from 'react';
import '../styles/FiltersPanel.css';
import { MdSearch, MdGridView, MdPayments, MdDevices, MdChair, MdHome, MdCheckroom, MdFitnessCenter, MdMenuBook, MdRestaurant, MdSpa, MdCategory } from 'react-icons/md';

export interface Filtros {
  categorias: string[];
  precioMin: number | '';
  precioMax: number | '';
  soloEnStock: boolean;
}

interface FiltersPanelProps {
  onFiltrosChange: (filtros: Filtros) => void;
  onSearch?: (query: string) => void;
}

const CATEGORIAS = [
  { id: 'tecnologia', label: 'Tecnología', icon: MdDevices },
  { id: 'muebles', label: 'Muebles', icon: MdChair },
  { id: 'hogar', label: 'Hogar', icon: MdHome },
  { id: 'ropa', label: 'Ropa y Accesorios', icon: MdCheckroom },
  { id: 'deportes', label: 'Deportes', icon: MdFitnessCenter },
  { id: 'libros', label: 'Libros y Educación', icon: MdMenuBook },
  { id: 'alimentos', label: 'Alimentos', icon: MdRestaurant },
  { id: 'salud', label: 'Salud y Belleza', icon: MdSpa },
  { id: 'otros', label: 'Otros', icon: MdCategory },
];

const CATEGORIA_BACKEND: Record<string, string> = {
  tecnologia: 'Tecnología',
  muebles: 'Muebles',
  hogar: 'Hogar',
  ropa: 'Ropa',
  deportes: 'Deportes',
  libros: 'Libros',
  alimentos: 'Alimentos',
  salud: 'Salud',
  otros: 'Otros',
};

export default function FiltersPanel({ onFiltrosChange, onSearch }: FiltersPanelProps) {
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [precioMin, setPrecioMin] = useState<number | ''>('');
  const [precioMax, setPrecioMax] = useState<number | ''>('');
  const [soloEnStock, setSoloEnStock] = useState(false);

  const toggleCategoria = (id: string) => {
    const updated = categoriasSeleccionadas.includes(id)
      ? categoriasSeleccionadas.filter(c => c !== id)
      : [...categoriasSeleccionadas, id];

    setCategoriasSeleccionadas(updated);
    emitir(updated, precioMin, precioMax, soloEnStock);
  };

  const handlePrecioMin = (val: string) => {
    const n = val === '' ? '' : Number(val);
    setPrecioMin(n);
    emitir(categoriasSeleccionadas, n, precioMax, soloEnStock);
  };

  const handlePrecioMax = (val: string) => {
    const n = val === '' ? '' : Number(val);
    setPrecioMax(n);
    emitir(categoriasSeleccionadas, precioMin, n, soloEnStock);
  };

  const emitir = (cats: string[], min: number | '', max: number | '', stock: boolean) => {
    onFiltrosChange({
      categorias: cats.map(id => CATEGORIA_BACKEND[id] ?? id),
      precioMin: min,
      precioMax: max,
      soloEnStock: stock,
    });
  };

  const limpiar = () => {
    setCategoriasSeleccionadas([]);
    setPrecioMin('');
    setPrecioMax('');
    setSoloEnStock(false);
    onFiltrosChange({ categorias: [], precioMin: '', precioMax: '', soloEnStock: false });
  };

  return (
    <aside className="marketplace-filters">
      <div className="marketplace-filters-container">
        {/* Búsqueda */}
        <div className="marketplace-filters-busqueda-wrapper">
          <div className="marketplace-filters-busqueda-caja">
            <MdSearch className=" marketplace-filters-busqueda-icono" />
            <input
              type="text"
              className="marketplace-filters-busqueda-input"
              placeholder="Buscar producto..."
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        <div className="marketplace-filters-header">
          <h2 className="marketplace-filters-title">Filtros</h2>
          {(categoriasSeleccionadas.length > 0 || precioMin !== '' || precioMax !== '' || soloEnStock) && (
            <button className="marketplace-filters-clear" onClick={limpiar}>Limpiar</button>
          )}
        </div>

        {/* CATEGORÍAS */}
        <div className="marketplace-filters-section">
          <h3 className="marketplace-filters-subtitle">
            <MdGridView className=" marketplace-filters-icono-subtitulo" />
            Categorías
          </h3>
          <ul className="marketplace-filters-list">
            {CATEGORIAS.map(cat => (
              <li key={cat.id}>
                <label className={`marketplace-filters-label ${categoriasSeleccionadas.includes(cat.id) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    className="marketplace-filters-checkbox"
                    checked={categoriasSeleccionadas.includes(cat.id)}
                    onChange={() => toggleCategoria(cat.id)}
                  />
                  <span className="marketplace-filters-icono-categoria" style={{ display: 'flex', alignItems: 'center' }}><cat.icon size={20} /></span>
                  <span className="marketplace-filters-text">{cat.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* RANGO DE PRECIO */}
        <div className="marketplace-filters-section">
          <h3 className="marketplace-filters-subtitle">
            <MdPayments className=" marketplace-filters-icono-subtitulo" />
            Rango de Precio
          </h3>
          <div className="marketplace-filters-price-range">
            <div className="marketplace-filters-price-input-group">
              <label>Mínimo</label>
              <div className="marketplace-filters-price-input">
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={precioMin}
                  onChange={e => handlePrecioMin(e.target.value)}
                />
              </div>
            </div>
            <div className="marketplace-filters-price-divider">—</div>
            <div className="marketplace-filters-price-input-group">
              <label>Máximo</label>
              <div className="marketplace-filters-price-input">
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="∞"
                  value={precioMax}
                  onChange={e => handlePrecioMax(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}