// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { productService } from '../../../services/products';
import { useNotification } from '../../../contexts/NotificationContext';
import type { ProductDto } from '../../../types/Producto';
import './styles/SellerProductModal.css';

interface SellerProductModalProps {
  isOpen: boolean;
  editingProduct: ProductDto | null;
  onClose: () => void;
  onGuardado: () => void;
}

export default function SellerProductModal({ isOpen, editingProduct, onClose, onGuardado }: SellerProductModalProps) {
  const { mostrarNotificacion } = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', stock: '', imageUrl: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name || '',
          description: editingProduct.description || '',
          price: editingProduct.price ? editingProduct.price.toString() : '0',
          category: editingProduct.category || '',
          stock: editingProduct.stock ? editingProduct.stock.toString() : '0',
          imageUrl: editingProduct.imageUrl || ''
        });
      } else {
        setFormData({ name: '', description: '', price: '', category: '', stock: '', imageUrl: '' });
      }
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock, 10),
        imageUrl: formData.imageUrl
      };
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id!, { ...editingProduct, ...payload });
        mostrarNotificacion('Producto actualizado correctamente', 'success');
      } else {
        await productService.createProduct(payload);
        mostrarNotificacion('Producto creado correctamente', 'success');
      }
      onGuardado();
      onClose();
    } catch (error) {
      console.error('Error saving product', error);
      mostrarNotificacion('Error al guardar el producto.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button className="modal-close" onClick={onClose} type="button">
            <MdClose />
          </button>
        </div>
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nombre</label>
              <input required className="form-input" id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="description">Descripción</label>
              <textarea required className="form-input" id="description" name="description" rows={3} value={formData.description} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="price">Precio ($)</label>
                <input required min="0.01" step="0.01" className="form-input" id="price" name="price" type="number" value={formData.price} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="stock">Stock</label>
                <input required min="0" className="form-input" id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="category">Categoría</label>
              <select required className="form-input" id="category" name="category" value={formData.category} onChange={handleChange}>
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
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="imageUrl">URL de la Imagen</label>
              <input className="form-input" id="imageUrl" name="imageUrl" type="url" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
