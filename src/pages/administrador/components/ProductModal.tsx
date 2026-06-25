// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MdClose, MdRefresh, MdSave } from 'react-icons/md';
import { Helmet } from 'react-helmet-async';
import { productService } from '../../../services/products';
import { useNotification } from '../../../contexts/NotificationContext';
import type { ProductDto } from '../../../types/Producto';
import './styles/ProductModal.css';

interface ProductoModalProps {
  producto: ProductDto | null; // null = crear, objeto = editar
  onClose: () => void;
  onGuardado: () => void;
}

export default function ProductModal({ producto, onClose, onGuardado }: ProductoModalProps) {
  const modoEdicion = producto !== null;
  const { mostrarNotificacion } = useNotification();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
  });
  
  useEffect(() => {
    setForm({
      name: producto?.name ?? '',
      description: producto?.description ?? '',
      price: producto?.price?.toString() ?? '',
      stock: producto?.stock?.toString() ?? '',
      category: producto?.category ?? '',
      imageUrl: producto?.imageUrl ?? '',
    });
  }, [producto]);

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

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
      mostrarNotificacion(modoEdicion ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente', 'success');
      onGuardado();
    } catch (err: any) {
      const msg =
        err.response?.data?.messages?.[0]?.description ||
        err.response?.data?.data ||
        'Error al guardar el producto';
      mostrarNotificacion(`Error: ${msg}`, 'error');
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
    <div>
      <Helmet>
        <title>{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'} | Panel de Administración</title>
        <meta
          name="description"
          content={modoEdicion ? `Editar el producto "${producto?.name}" en el panel de administración.` : 'Crear un nuevo producto en el panel de administración.'}
        />
        <meta name="keywords" content="administración, productos, panel, gestión, editar, crear" />
        <meta name="author" content="Panel de Administración" />
        <meta property="og:title" content={modoEdicion ? `Editar Producto: ${producto?.name}` : 'Nuevo Producto'} />
        <meta property="og:description" content={modoEdicion ? `Editar el producto "${producto?.name}" en el panel de administración.` : 'Crear un nuevo producto en el panel de administración.'} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={producto?.imageUrl || 'https://example.com/default-image.jpg'  } />
      </Helmet>

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

            <div className="gp-modal-campo">
              <label className="gp-modal-label">Categoría *</label>
              <select
                className={`gp-modal-input ${errores.category ? 'error' : ''}`}
                value={form.category}
                onChange={e => {
                  setForm(f => ({ ...f, category: e.target.value }));
                  setErrores(er => { const n = { ...er }; delete n.category; return n; });
                }}
              >
                <option value="" disabled>Seleccione una categoría</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Muebles">Muebles</option>
                <option value="Hogar">Hogar</option>
                <option value="Ropa">Ropa y Accesorios</option>
                <option value="Deportes">Deportes</option>
                <option value="Libros">Libros y Educación</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Salud">Salud y Belleza</option>
                <option value="Otros">Otros</option>
              </select>
              {errores.category && <span className="gp-modal-error">{errores.category}</span>}
            </div>
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
    </div>
  );
}
