import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirm: z.string().optional(),
}).superRefine((data, ctx) => {
  if ('confirm' in data && data.confirm !== undefined && data.confirm !== data.password) {
    ctx.addIssue({ code: 'custom', message: 'Passwords do not match', path: ['confirm'] });
  }
});

type FormValues = z.infer<typeof schema>;

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode: 'login' | 'register' = location.pathname.includes('register') ? 'register' : 'login';
  const { login, register: signUp, status } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirm: '' },
  });

  async function onSubmit(values: FormValues) {
    if (mode === 'login') {
      await login(values.email, values.password);
    } else {
      await signUp(values.email, values.password);
    }
    navigate('/app');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-900">
          {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

          <Input label="Password" type="password" {...register('password')} />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

          {mode === 'register' && (
            <>
              <Input label="Confirm Password" type="password" {...register('confirm')} />
              {errors.confirm && <p className="text-sm text-red-600">{errors.confirm.message}</p>}
            </>
          )}

          <Button type="submit" className="w-full py-3" disabled={status === 'loading'}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <span>
              Need an account?{' '}
              <Link className="text-primary hover:underline" to="/auth/register">
                Create one
              </Link>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <Link className="text-primary hover:underline" to="/auth/login">
                Sign in
              </Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 