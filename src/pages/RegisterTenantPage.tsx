import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Building2, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { BrandLogo } from '../components/common/BrandLogo';

export const RegisterTenantPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerTenant } = useAuth();

  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('free');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!tenantName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await registerTenant({
        tenant_name: tenantName.trim(),
        email: email.trim(),
        password,
        plan,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.message || 'Could not create the workspace. Please try again.'
        );
      } else {
        setErrorMessage('An unexpected error occurred while creating the workspace.');
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
          Create a New Workspace
        </h2>
        <p className="mt-2 text-xs text-slate-300">
          Set up your Kuri workspace with the initial administrator account
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Workspace name"
                labelClassName="text-white"
                type="text"
                required
                placeholder="Acme Corporation"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                leftIcon={<Building2 className="h-4 w-4" />}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-400 focus:border-emerald-500"
              />
            </div>

            <div>
              <Input
                label="Administrator email"
                labelClassName="text-white"
                type="email"
                required
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-400 focus:border-emerald-500"
              />
            </div>

            <div>
              <Input
                label="Password"
                labelClassName="text-white"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-400 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                Starting plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan('free')}
                  className={`p-3 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                    plan === 'free'
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">Free plan</p>
                    <p className="text-[10px] text-slate-300">Essentials to get started</p>
                  </div>
                  {plan === 'free' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPlan('pro')}
                  className={`p-3 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                    plan === 'pro'
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white">Pro plan</p>
                    <p className="text-[10px] text-slate-300">Built to scale B2B teams</p>
                  </div>
                  {plan === 'pro' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-3"
                isLoading={isSubmitting}
              >
                Create Workspace and Get Started
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-300">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
