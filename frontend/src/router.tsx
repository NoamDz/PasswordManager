import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import AuthPage from './pages/AuthPage';
import { AuthProvider, RequireAuth } from './context/AuthContext';
import App from './App';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/welcome" />,
  },
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/auth/login',
    element: <AuthPage />,
  },
  {
    path: '/auth/register',
    element: <AuthPage />,
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
  },
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
} 