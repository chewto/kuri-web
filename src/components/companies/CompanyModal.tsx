import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { Company, CompanyFormData } from '../../types/company';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { sanitizePhone, validatePhone } from '../../utils/validators';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  initialData?: Company | null;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    tax_id: '',
    industry: '',
    website: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        tax_id: initialData.tax_id || '',
        industry: initialData.industry || '',
        website: initialData.website || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
      });
    } else {
      setFormData({
        name: '',
        tax_id: '',
        industry: '',
        website: '',
        phone: '',
        address: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Sanitizador de teléfono: solo permite '+' al inicio y dígitos
  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: sanitizePhone(value) }));
  };

  // Sanitizador y formateador de RIF / Tax ID (Ej: J-12345678-9 o J-12345678)
  const handleTaxIdChange = (value: string) => {
    // Convertir a mayúsculas y permitir letras de RIF (J, G, V, E, C) seguido de números y guiones
    const upper = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, tax_id: upper }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la empresa es obligatorio';
    }

    // 2. Documento fiscal / RIF
    // Formatos válidos: J-12345678, J-12345678-0, G-12345678-9, V-12345678, etc. o alfanumérico fiscal estándar
    const rifRegex = /^[JGVECjgvec]-?\d{7,9}(-?\d)?$/;
    if (!formData.tax_id?.trim()) {
      newErrors.tax_id = 'El RIF / Tax ID es obligatorio';
    } else if (!rifRegex.test(formData.tax_id.trim())) {
      newErrors.tax_id = 'Formato de RIF inválido. Ej: J-12345678-9 o J-12345678';
    }

    // 3. Industria
    if (!formData.industry?.trim()) {
      newErrors.industry = 'El sector o industria es obligatorio';
    }

    // 4. Sitio Web (URL real con o sin protocolo: dominio.tld)
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
    if (!formData.website?.trim()) {
      newErrors.website = 'El sitio web es obligatorio';
    } else if (!urlRegex.test(formData.website.trim())) {
      newErrors.website = 'Ingresa una URL real y válida (ej: empresa.com o https://empresa.com)';
    }

    // 5. Teléfono: solo números, sin letras. Máximo 10 dígitos nacionales
    // (ignorando el código de país 58 y el 0 inicial)
    const phoneError = validatePhone(formData.phone || '', { required: true });
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    // 6. Dirección
    if (!formData.address?.trim()) {
      newErrors.address = 'La dirección fiscal o física es obligatoria';
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
        submit: error.response?.data?.message || 'Error al guardar la empresa. Revisa los datos.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {initialData ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <p className="text-xs text-slate-500">
                {initialData ? 'Modifica los detalles de la organización' : 'Registra una nueva cuenta corporativa'}
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

          <Input
            label="Nombre de la Empresa *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Inversiones Tecnológicas S.A."
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="RIF / Identificación Fiscal *"
              value={formData.tax_id || ''}
              onChange={(e) => handleTaxIdChange(e.target.value)}
              placeholder="Ej: J-12345678-9"
              helperText="Prefijo J-, G-, V- o E- seguido de dígitos"
              error={errors.tax_id}
              required
            />
            <Input
              label="Industria / Sector *"
              value={formData.industry || ''}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="Ej: Software, Retail, Alimentos"
              error={errors.industry}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sitio Web *"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Ej: miempresa.com o https://miempresa.com"
              helperText="Dominio válido (ej: empresa.com)"
              error={errors.website}
              required
            />
            <Input
              label="Teléfono corporativo *"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Ej: +58 4121234567"
              helperText="Solo números, exactamente 10 dígitos (ej: 4121234567)"
              error={errors.phone}
              required
            />
          </div>

          <Input
            label="Dirección fiscal o física *"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Ej: Av. de la Innovación 42, Planta 3"
            error={errors.address}
            required
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {initialData ? 'Actualizar Empresa' : 'Crear Empresa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
