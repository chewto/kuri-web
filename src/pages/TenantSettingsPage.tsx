import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Mail,
  RefreshCw,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { RoleBadge } from '../components/team/RoleBadge';

interface Feedback {
  tone: 'success' | 'error';
  message: string;
}

const formatPlan = (plan?: string): string => {
  if (!plan) return 'Free';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
};

export const TenantSettingsPage: React.FC = () => {
  const { tenant, user, refreshProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleCopyTenantId = async () => {
    if (!tenant) return;

    try {
      await navigator.clipboard.writeText(tenant.id);
      setCopied(true);
      setFeedback({ tone: 'success', message: 'Tenant ID copiado al portapapeles.' });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFeedback({
        tone: 'error',
        message: 'No se pudo copiar el Tenant ID. Tu navegador puede bloquear el portapapeles.',
      });
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setFeedback(null);

    try {
      await refreshProfile();
      setFeedback({
        tone: 'success',
        message: 'Datos de la organización sincronizados con el servidor.',
      });
    } catch {
      setFeedback({
        tone: 'error',
        message: 'No se pudieron sincronizar los datos de la organización.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!tenant) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">
          No hay una organización cargada
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
          Sincroniza la sesión para recuperar los datos del tenant desde el servidor.
        </p>
        <Button variant="outline" size="md" className="mt-4" onClick={handleSync} isLoading={isSyncing}>
          <RefreshCw className="h-4 w-4" />
          Sincronizar datos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Configuración del Tenant</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Resumen de la organización, plan activo y datos de la sesión actual.
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={handleSync}
          isLoading={isSyncing}
          title="Sincronizar datos con el servidor"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sincronizar datos</span>
        </Button>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
            feedback.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.tone === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {feedback.message}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-4 font-bold opacity-70 hover:opacity-100"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Organización</h2>
                  <p className="text-xs text-slate-500">
                    Identidad y estado actual del workspace
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  tenant.is_active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    tenant.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {tenant.is_active ? 'Activo' : 'Suspendido'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Nombre
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{tenant.name}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Plan activo
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold capitalize text-emerald-700">
                  <CreditCard className="h-3.5 w-3.5" />
                  {formatPlan(tenant.plan)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Fecha de alta
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDate(tenant.created_at) || '—'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Tu rol
                </p>
                <div className="mt-1">
                  {user ? <RoleBadge role={user.role} /> : <span className="text-slate-400">—</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Actualización básica</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Datos generales que definen la organización
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-slate-300" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nombre de la Organización"
                value={tenant.name}
                disabled
                readOnly
                helperText="La edición del nombre requiere un endpoint de actualización."
              />
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Plan
                </label>
                <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm capitalize text-slate-500">
                  {formatPlan(tenant.plan)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                La API actual solo expone lectura del tenant. Los cambios de nombre o plan
                se gestionan con el administrador de la plataforma; no se simulan guardados
                locales.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-4">
              <Button
                variant="primary"
                size="md"
                disabled
                title="Función no disponible: el backend no expone actualización de tenant"
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Tenant ID</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Identificador único de tu organización
            </p>
            <p className="mt-3 break-all rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
              {tenant.id}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTenantId}
              className="mt-3 w-full"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copiado' : 'Copiar Tenant ID'}</span>
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Sesión actual</h2>
                <p className="text-xs text-slate-500">Tu cuenta en este tenant</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500">Correo</span>
                <span className="break-all text-right font-semibold text-slate-800">
                  {user?.email || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Rol</span>
                {user ? <RoleBadge role={user.role} /> : <span className="text-slate-400">—</span>}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Estado</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Activo
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-white">Soporte de plataforma</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Para cambios de plan, facturación o edición del tenant, contacta al
              administrador de la plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSettingsPage;
