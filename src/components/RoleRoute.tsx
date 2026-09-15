import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

interface RoleRouteProps {
  role: 'fan' | 'creator';
  children: ReactElement;
}

/** Redirects away from a role-specific route when the active role doesn't match. */
export function RoleRoute({ role, children }: RoleRouteProps) {
  const activeRole = useSessionStore((s) => s.user?.activeRole);

  if (activeRole && activeRole !== role) {
    return <Navigate to={role === 'creator' ? '/app' : '/studio'} replace />;
  }

  return children;
}
