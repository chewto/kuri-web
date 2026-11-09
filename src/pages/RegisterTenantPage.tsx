import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Building2, Mail, Lock, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

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
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener un mínimo de 6 caracteres.');
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
          err.response?.data?.message || 'Error al registrar la organización. Intenta nuevamente.'
        );
      } else {
        setErrorMessage('Ocurrió un error inesperado al registrar el Tenant.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 items-center justify-center text-emerald-400 mb-4 shadow-sm">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Registrar Nueva Organización
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Crea tu Tenant e inicia con la cuenta administradora inicial
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
                label="Nombre de la Empresa / Organización"
                labelClassName="text-white"
                type="text"
                required
                placeholder="Acme Corporation"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                leftIcon={<Building2 className="h-4 w-4" />}
                className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <Input
                label="Correo del Administrador"
                labelClassName="text-white"
                type="email"
                required
                placeholder="admin@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <Input
                label="Contraseña"
                labelClassName="text-white"
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                className="bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Plan de Inicio
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
                    <p className="font-semibold text-slate-200">Plan Gratuito</p>
                    <p className="text-[10px] text-slate-400">Básico para inicio</p>
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
                    <p className="font-semibold text-slate-200">Plan Pro</p>
                    <p className="text-[10px] text-slate-400">Escalamiento B2B</p>
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
                Crear Organización y Empezar
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              ¿Ya tienes una cuenta registrada?{' '}
              <Link
                to="/login"
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
