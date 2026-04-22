import React, { useState, useEffect } from 'react';
import { predictionAPI, inventoryAPI } from '../services/api';

export default function Predict() {
  const [products, setProducts]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [salesCtx, setSalesCtx]     = useState('');
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    inventoryAPI.getAllProducts().then(r => setProducts(r.data)).catch(console.error);
  }, []);

  const riskColor = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };

  const handlePredict = async () => {
    if (!selected) return alert('Please select a product');
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        productName: selected.name,
        sku: selected.sku,
        category: selected.category,
        currentStock: selected.currentStock,
        minStockThreshold: selected.minStockThreshold,
        maxStockCapacity: selected.maxStockCapacity,
        storeId: selected.storeId,
        salesContext: salesCtx || null
      };
      const r = await predictionAPI.predict(payload);
      setResult(r.data);
    } catch (err) {
      alert('Prediction error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>AI Prediction</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Get OpenAI-powered stockout predictions</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Input Panel */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Select Product</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151',
                            display: 'block', marginBottom: 8 }}>Product</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                             borderRadius: 8, fontSize: 14, background: 'white' }}
              onChange={e => {
                const p = products.find(p => p.id === parseInt(e.target.value));
                setSelected(p || null);
              }}>
              <option value="">-- Choose a product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — {p.stockStatus}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
                Product Details
              </div>
              {[
                ['Category', selected.category],
                ['Store', selected.storeId],
                ['Current Stock', selected.currentStock],
                ['Min Threshold', selected.minStockThreshold],
                ['Max Capacity', selected.maxStockCapacity],
                ['Status', selected.stockStatus],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                                      fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#6b7280' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151',
                            display: 'block', marginBottom: 8 }}>
              Sales Context (optional)
            </label>
            <textarea
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                       borderRadius: 8, fontSize: 14, resize: 'vertical', minHeight: 80 }}
              placeholder="e.g. Holiday season approaching, weekend sales spike 3x..."
              value={salesCtx}
              onChange={e => setSalesCtx(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: 12 }}
            onClick={handlePredict} disabled={loading || !selected}>
            {loading ? '🤖 Analyzing...' : '🤖 Get AI Prediction'}
          </button>
        </div>

        {/* Result Panel */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Prediction Result</h3>
          {!result && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
              <div>Select a product and click predict</div>
            </div>
          )}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
              <div>AI is analyzing inventory data...</div>
            </div>
          )}
          {result && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{result.productName}</div>
                <span style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: riskColor[result.riskLevel] + '20',
                  color: riskColor[result.riskLevel]
                }}>
                  {result.riskLevel} RISK
                </span>
              </div>

              <div style={{ background: '#f0f9ff', borderRadius: 8, padding: 16, marginBottom: 16,
                            borderLeft: `4px solid ${riskColor[result.riskLevel]}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Prediction
                </div>
                <div style={{ fontSize: 14, color: '#1e40af' }}>{result.prediction}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  ['Recommended Order', result.recommendedOrderQty + ' units', '#4f46e5'],
                  ['Stockout In', result.estimatedStockoutIn, '#ef4444'],
                  ['Current Stock', result.currentStock + ' units', '#374151'],
                  ['Stock Status', result.stockStatus, '#374151'],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fffbeb', borderRadius: 8, padding: 16,
                            borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  AI Reasoning
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{result.reasoning}</div>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
                Generated: {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
