import React, { useEffect, useState } from 'react';
import { inventoryAPI } from '../services/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editStock, setEditStock] = useState({ id: null, value: '' });
  const [form, setForm] = useState({
    name:'', sku:'', description:'', category:'',
    currentStock:'', minStockThreshold:'', maxStockCapacity:'', storeId:''
  });

  const load = () => {
    setLoading(true);
    inventoryAPI.getAllProducts()
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.createProduct({
        ...form,
        currentStock: parseInt(form.currentStock),
        minStockThreshold: parseInt(form.minStockThreshold),
        maxStockCapacity: parseInt(form.maxStockCapacity),
      });
      setShowForm(false);
      setForm({ name:'', sku:'', description:'', category:'',
                currentStock:'', minStockThreshold:'', maxStockCapacity:'', storeId:'' });
      load();
    } catch(err) {
      alert('Error creating product: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateStock = async (id) => {
    try {
      await inventoryAPI.updateStock(id, parseInt(editStock.value));
      setEditStock({ id: null, value: '' });
      load();
    } catch(err) {
      alert('Error updating stock');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await inventoryAPI.deleteProduct(id);
      load();
    } catch(err) {
      alert('Error deleting product');
    }
  };

  const statusBadge = (s) => {
    const map = { IN_STOCK: 'success', LOW_STOCK: 'warning', OUT_OF_STOCK: 'danger' };
    return <span className={`badge badge-${map[s] || 'info'}`}>{s}</span>;
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: 14, outline: 'none'
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Inventory</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>Manage products and stock levels</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20, fontWeight: 600 }}>Add New Product</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                ['name','Product Name'],['sku','SKU'],['category','Category'],
                ['storeId','Store ID'],['description','Description'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input style={inputStyle} value={form[key]}
                    onChange={e => setForm({...form, [key]: e.target.value})} required />
                </div>
              ))}
              {[
                ['currentStock','Current Stock'],['minStockThreshold','Min Threshold'],['maxStockCapacity','Max Capacity']
              ].map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input style={inputStyle} type="number" min="0" value={form[key]}
                    onChange={e => setForm({...form, [key]: e.target.value})} required />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Create Product</button>
              <button type="button" className="btn" style={{ background: '#f3f4f6' }}
                onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="card">
        {loading ? <div style={{ color: '#6b7280' }}>Loading...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Product','SKU','Category','Store','Current Stock','Min/Max','Status','Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left',
                                       fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13 }}>{p.sku}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13 }}>{p.category}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13 }}>{p.storeId}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {editStock.id === p.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input type="number" style={{ ...inputStyle, width: 80 }}
                          value={editStock.value}
                          onChange={e => setEditStock({ ...editStock, value: e.target.value })} />
                        <button className="btn btn-success" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => handleUpdateStock(p.id)}>✓</button>
                        <button className="btn" style={{ padding: '4px 10px', fontSize: 12, background: '#f3f4f6' }}
                          onClick={() => setEditStock({ id: null, value: '' })}>✕</button>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 600, cursor: 'pointer',
                                     color: p.currentStock <= p.minStockThreshold ? '#ef4444' : '#1a1a2e' }}
                        onClick={() => setEditStock({ id: p.id, value: p.currentStock })}>
                        {p.currentStock} <span style={{ fontSize: 11, color: '#9ca3af' }}>✏️</span>
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                    {p.minStockThreshold} / {p.maxStockCapacity}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{statusBadge(p.stockStatus)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
