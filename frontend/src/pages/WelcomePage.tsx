import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left sidebar */}
      <div className="hidden md:block w-64 bg-gray-100 border-r border-gray-200"></div>

      {/* Main content */}
      <div className="flex flex-col flex-1 items-center justify-center space-y-6 p-6 max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-md">
          <span className="text-white text-4xl font-bold">🔐</span>
        </div>
        <h1 className="text-4xl font-semibold text-gray-900 text-center">Welcome to Password Manager</h1>

        <Link to="/auth/login" className="w-full">
          <Button className="w-full py-3" variant="primary">
            Sign In
          </Button>
        </Link>
        <Link to="/auth/register" className="w-full">
          <Button className="w-full py-3" variant="secondary">
            Create New Account
          </Button>
        </Link>
      </div>
    </div>
  );
} 