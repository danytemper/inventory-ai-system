import React, { useEffect, useState } from 'react';
import { healthAPI } from '../services/api';

export default function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const check = () => {
    setLoading(true);
    healthAPI.getAllHealth()
      .then(r => { setHealth(r.data); setLastChecked(new Date()); })
      .catch(() => setHealth({ gateway: 'DOWN', inventoryService: 'DOWN', aiPredictionService: 'DOWN' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { check(); }, []);

  const services = health ? [
    { name: 'API Gateway',          key: 'gateway',             port: 8082, icon: '🔀' },
    { name: 'Inventory Service',    key: 'inventoryService',    port: 8080, icon: '📦' },
    { name: 'AI Prediction Service',key: 'aiPredictionService', port: 8081, icon: '🤖' },
  ] : [];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>System Health</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>
            {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Checking...'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={check} disabled={loading}>
          {loading ? 'Checking...' : '🔄 Refresh'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {services.map(s => {
          const up = health[s.key] === 'UP';
          return (
            <div key={s.key} className="card"
              style={{ borderLeft: `4px solid ${up ? '#10b981' : '#ef4444'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>Port {s.port}</div>
                </div>
                <span style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: up ? '#d1fae5' : '#fee2e2',
                  color: up ? '#065f46' : '#991b1b'
                }}>
                  {up ? '● UP' : '● DOWN'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
