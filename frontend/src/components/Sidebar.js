import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/',           icon: '📊', label: 'Dashboard'   },
  { path: '/inventory',  icon: '📦', label: 'Inventory'   },
  { path: '/predict',    icon: '🤖', label: 'AI Predict'  },
  { path: '/health',     icon: '💚', label: 'Health'      },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div style={{
      width: 220, minHeight: '100vh', background: '#1a1a2e',
      display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed'
    }}>
      <div style={{ padding: '0 20px 32px', borderBottom: '1px solid #2d2d4e' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>🏪 InvenAI</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Inventory Management</div>
      </div>

      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                background: active ? '#4f46e5' : 'transparent',
                color: active ? 'white' : '#9ca3af',
                transition: 'all 0.2s', cursor: 'pointer'
              }}>
                <span>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #2d2d4e' }}>
        <div style={{ fontSize: 11, color: '#4b5563' }}>Powered by</div>
        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Spring Boot + OpenAI</div>
      </div>
    </div>
  );
}
