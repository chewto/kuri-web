import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Enter both your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.message || 'Authentication failed. Check your credentials.'
        );
      } else {
        setErrorMessage('An unexpected error occurred while signing in.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo size="md" className="mb-4" />
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Sign in to Kuri
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Sign in to your organization's workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {errorMessage && (
            <div className="mb-6 rounded-lg bg-rose-950/60 border border-rose-800/60 p-3.5 flex items-start gap-3 text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <p className="text-xs font-medium">{errorMessage}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Email address"
                labelClassName="text-white"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <Input
                label="Password"
                labelClassName="text-white"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Sign in to Kuri <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Don't have a workspace yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Create workspace
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
