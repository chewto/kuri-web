import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { Contact, ContactFormData } from '../../types/contact';
import { Company } from '../../types/company';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { sanitizePhone, validatePhone } from '../../utils/validators';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => Promise<void>;
  initialData?: Contact | null;
  companies: Company[];
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  companies,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    company_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        position: initialData.position || '',
        company_id: initialData.company_id || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        company_id: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Sanitizador de teléfono: solo permite '+' al inicio y dígitos
  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: sanitizePhone(value) }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es obligatorio';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es obligatorio';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un formato de email válido';
    }
    const phoneError = validatePhone(formData.phone || '');
    if (phoneError) {
      newErrors.phone = phoneError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrors({
        submit: error.response?.data?.message || 'Error al guardar el contacto. Revisa los datos.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {initialData ? 'Editar Contacto' : 'Nuevo Contacto'}
              </h2>
              <p className="text-xs text-slate-500">
                {initialData ? 'Actualiza los datos del profesional' : 'Añade una persona de contacto a tu CRM'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Ej: Laura"
              error={errors.first_name}
              required
            />
            <Input
              label="Apellidos *"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Ej: Gómez Méndez"
              error={errors.last_name}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Correo Electrónico *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="laura.gomez@empresa.com"
              error={errors.email}
              required
            />
            <Input
              label="Teléfono Móvil / Directo"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Ej: +58 4121234567"
              helperText="Solo números, exactamente 10 dígitos (ej: 4121234567)"
              error={errors.phone}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cargo / Título"
              value={formData.position || ''}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Ej: Directora de Compras"
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Empresa Asociada
              </label>
              <select
                value={formData.company_id || ''}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 text-sm py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-colors bg-white shadow-sm"
              >
                <option value="">-- Sin Empresa Asignada --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {initialData ? 'Actualizar Contacto' : 'Crear Contacto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
