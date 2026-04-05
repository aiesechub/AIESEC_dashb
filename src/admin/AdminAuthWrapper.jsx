// src/admin/AdminAuthWrapper.jsx
// Protected wrapper for admin routes with security checks
// OWASP: A01 (Broken Access Control), A07 (Authentication Failures)

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  setupSessionSecurity,
  verifyAdminRole,
  setupSecurityHeaders,
  checkRateLimit,
} from '../lib/securityUtils';
import LoadingScreen from '../components/LoadingScreen';

/**
 * AdminAuthWrapper: Protects all admin routes
 * - Verifies user is authenticated
 * - Verifies user has admin role
 * - Enforces session security
 * - Injects security headers
 */
export default function AdminAuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [sessionCleanup, setSessionCleanup] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Setup security headers on mount
        setupSecurityHeaders();

        // Check current session
        const { data: session } = await supabase.auth.getSession();

        if (!session?.user?.id) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Verify admin role
        const result = await verifyAdminRole();

        if (result.valid) {
          setIsAdmin(true);

          // Setup session security (inactivity timeout, etc.)
          const cleanup = setupSessionSecurity();
          setSessionCleanup(() => cleanup.cleanup);
        } else {
          setIsAdmin(false);
          setAuthError(result.error || 'Admin verification failed');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError(error.message);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        // Re-verify admin status
        const result = await verifyAdminRole();
        setIsAdmin(result.valid);
      }
    });

    // Cleanup
    return () => {
      subscription?.unsubscribe();
      sessionCleanup?.();
    };
  }, []);

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Verifying admin access..." />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-auth-error">
        <div className="error-container">
          <h1>Authentication Required</h1>
          <p>Please log in to access the admin dashboard.</p>
          <button
            onClick={() => (window.location.href = '/admin/login')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>

        <style jsx>{`
          .admin-auth-error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .error-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
          }

          h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }

          p {
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }

          .btn-primary {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.3s ease;
          }

          .btn-primary:hover {
            background: #764ba2;
          }
        `}</style>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="admin-auth-error">
        <div className="error-container">
          <h1>Access Denied</h1>
          <p>
            {authError ||
              'You do not have permission to access the admin dashboard.'}
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-primary"
          >
            Sign Out
          </button>
        </div>

        <style jsx>{`
          .admin-auth-error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          .error-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
          }

          h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }

          p {
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }

          .btn-primary {
            background: #f5576c;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.3s ease;
          }

          .btn-primary:hover {
            background: #f093fb;
          }
        `}</style>
      </div>
    );
  }

  // Authenticated and admin - render protected content
  return <div className="admin-auth-wrapper">{children}</div>;
}
