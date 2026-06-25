// @ts-nocheck
import { useState, useEffect } from 'react';
import { MdClose, MdRefresh, MdSave } from 'react-icons/md';
import { productService } from '../../../services/products';
import type { ProductDto } from '../../../types/Producto';
import './styles/GenericProductModal.css';

interface GenericProductModalProps {
  producto: ProductDto | null; // null = crear, objeto = editar
  onClose: () => void;
  onGuardado: () => void;
}

export default function GenericProductModal({ producto, onClose, onGuardado }: GenericProductModalProps) {
  const modoEdicion = producto !== null;

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm({
      name: producto?.name ?? '',
      description: producto?.description ?? '',
      price: producto?.price?.toString() ?? '',
      stock: producto?.stock?.toString() ?? '',
      category: producto?.category ?? '',
      imageUrl: producto?.imageUrl ?? '',
    });
    setErrores({});
  }, [producto]);

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'El precio debe ser mayor a 0';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = 'El stock debe ser 0 o mayor';
    if (!form.category.trim()) e.category = 'La categoría es obligatoria';
    return e;
  };

  const handleSubmit = async () => {
    const e = validar();
    if (Object.keys(e).length > 0) { setErrores(e); return; }

    try {
      setGuardando(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
      };

      if (modoEdicion && producto) {
        await productService.updateProduct(producto.id, {
          ...producto,
          ...payload,
        });
      } else {
        await productService.createProduct(payload);
      }
      onGuardado();
    } catch (err: any) {
      const msg =
        err.response?.data?.messages?.[0]?.description ||
        err.response?.data?.data ||
        'Error al guardar el producto';
      alert(`Error: ${msg}`);
    } finally {
      setGuardando(false);
    }
  };

  const campo = (
    label: string,
    key: keyof typeof form,
    tipo: string = 'text',
    placeholder: string = ''
  ) => (
    <div className="gp-modal-campo">
      <label className="gp-modal-label">{label}</label>
      <input
        type={tipo}
        className={`gp-modal-input ${errores[key] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => {
          setForm(f => ({ ...f, [key]: e.target.value }));
          setErrores(er => { const n = { ...er }; delete n[key]; return n; });
        }}
      />
      {errores[key] && <span className="gp-modal-error">{errores[key]}</span>}
    </div>
  );

  return (
    <div className="gp-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="gp-modal">
        <div className="gp-modal-header">
          <h3 className="gp-modal-titulo">
            {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button className="gp-modal-cerrar" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="gp-modal-cuerpo">
          {campo('Nombre *', 'name', 'text', 'Ej: Laptop HP 15')}
          {campo('Descripción', 'description', 'text', 'Descripción del producto')}

          <div className="gp-modal-fila-doble">
            {campo('Precio *', 'price', 'number', '0.00')}
            {campo('Stock *', 'stock', 'number', '0')}
          </div>

          {campo('Categoría *', 'category', 'text', 'Ej: Tecnología')}
          {campo('URL de Imagen', 'imageUrl', 'text', 'https://...')}
        </div>

        <div className="gp-modal-pie">
          <button className="gp-btn-secundario" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className="gp-btn-primario" onClick={handleSubmit} disabled={guardando}>
            {guardando ? (
              <>
                <MdRefresh className=" gp-spin" style={{ fontSize: 18 }} />
                Guardando...
              </>
            ) : (
              <>
                <MdSave style={{ fontSize: 18 }} />
                {modoEdicion ? 'Guardar Cambios' : 'Crear Producto'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
