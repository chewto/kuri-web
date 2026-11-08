import React, { useEffect, useState } from 'react';
import { KeyRound, Mail, UserPlus, X } from 'lucide-react';
import {
  ASSIGNABLE_ROLES,
  InviteMemberFormData,
  ROLE_LABELS,
  Role,
} from '../../types/team';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InviteMemberFormData) => Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialFormData: InviteMemberFormData = {
  email: '',
  password: '',
  role: 'User',
};

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<InviteMemberFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Ingresa un formato de correo válido.';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setErrors({
        submit:
          apiError.response?.data?.message ||
          'No se pudo invitar al miembro. Revisa los datos e inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Invitar Miembro</h2>
              <p className="text-xs text-slate-500">
                Crea el acceso de un nuevo integrante del equipo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {errors.submit && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {errors.submit}
            </div>
          )}

          <Input
            label="Correo Electrónico *"
            type="email"
            value={formData.email}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="nuevo.miembro@empresa.com"
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            required
          />

          <Input
            label="Contraseña Inicial *"
            type="password"
            value={formData.password}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
            helperText="El miembro usará este correo y contraseña para iniciar sesión."
            leftIcon={<KeyRound className="h-4 w-4" />}
            autoComplete="new-password"
            required
          />

          <div>
            <label
              htmlFor="invite-member-role"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Rol inicial *
            </label>
            <select
              id="invite-member-role"
              value={formData.role}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  role: event.target.value as Role,
                }))
              }
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            >
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] leading-relaxed text-slate-500">
              El backend registra la cuenta inmediatamente; no se envía un correo de
              invitación. Comparte las credenciales iniciales con el nuevo miembro.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Invitar Miembro
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
