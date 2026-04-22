import React, { useEffect, useState } from 'react';
import { inventoryAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [products, setProducts]   = useState([]);
  const [lowStock, setLowStock]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      inventoryAPI.getAllProducts(),
      inventoryAPI.getLowStockProducts()
    ]).then(([p, l]) => {
      setProducts(p.data);
      setLowStock(l.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: '#6b7280' }}>Loading dashboard...</div>;

  const inStock    = products.filter(p => p.stockStatus === 'IN_STOCK').length;
  const lowStockN  = products.filter(p => p.stockStatus === 'LOW_STOCK').length;
  const outOfStock = products.filter(p => p.stockStatus === 'OUT_OF_STOCK').length;

  const pieData = [
    { name: 'In Stock',     value: inStock    },
    { name: 'Low Stock',    value: lowStockN  },
    { name: 'Out of Stock', value: outOfStock },
  ];

  const barData = products.map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    current: p.currentStock,
    minimum: p.minStockThreshold
  }));

  const statCards = [
    { label: 'Total Products',  value: products.length, color: '#4f46e5', icon: '📦' },
    { label: 'In Stock',        value: inStock,          color: '#10b981', icon: '✅' },
    { label: 'Low Stock',       value: lowStockN,        color: '#f59e0b', icon: '⚠️' },
    { label: 'Out of Stock',    value: outOfStock,       color: '#ef4444', icon: '❌' },
  ];

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>AI-Powered Inventory Overview</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
              </div>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Stock Levels vs Minimum Threshold</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" style={{ fontSize: 12 }} />
              <YAxis style={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="current" fill="#4f46e5" name="Current Stock" radius={[4,4,0,0]} />
              <Bar dataKey="minimum" fill="#f59e0b" name="Min Threshold" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Stock Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90}
                   dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                   labelLine={false} style={{ fontSize: 11 }}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: '#ef4444' }}>
            🚨 Low Stock Alerts ({lowStock.length})
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fef2f2' }}>
                {['Product', 'SKU', 'Store', 'Current Stock', 'Min Threshold', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12,
                                       fontWeight: 600, color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 13 }}>{p.sku}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 13 }}>{p.storeId}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#ef4444' }}>{p.currentStock}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{p.minStockThreshold}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge badge-${p.stockStatus === 'OUT_OF_STOCK' ? 'danger' : 'warning'}`}>
                      {p.stockStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
