// tests/AuthContext.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { AppRole } from '@/types/apiContracts';

const TestAuthConsumer: React.FC = () => {
  const { role, user } = useAuth();
  return (
    <div data-testid="auth-info">
      <span data-testid="role">{role}</span>
      <span data-testid="name">{user?.fullName}</span>
      <span data-testid="badge">{user?.badgeCode}</span>
    </div>
  );
};

describe('AuthContext & ProtectedRoute Security Engine', () => {
  it('renders default ADMIN role and DRM persona on initial render', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(html).toContain('ADMIN');
    expect(html).toContain('Divisional Railway Manager (DRM)');
    expect(html).toContain('DRM-HQ');
  });

  it('allows access through ProtectedRoute when role is in allowedRoles', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <ProtectedRoute allowedRoles={['ADMIN', 'CORRIDOR_PLANNER']} screenName="Test Screen">
          <div data-testid="secret-content">Restricted Content Authorized</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    // Initial server snapshot returns ADMIN which is in allowedRoles
    expect(html).toContain('Restricted Content Authorized');
  });

  it('renders statutory restriction banner when role is not in allowedRoles', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <ProtectedRoute allowedRoles={['FIELD_WORKER']} screenName="Ground Check-in Only">
          <div data-testid="secret-content">Restricted Content Authorized</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    // ADMIN is not in ['FIELD_WORKER']
    expect(html).toContain('Access Restricted: Ground Check-in Only');
    expect(html).toContain('Statutory Access Control (IRPWM Ch 5 / RDSO Cyber Protocol)');
    expect(html).toContain('Authorized Roles:');
    expect(html).toContain('FIELD_WORKER');
  });
});
