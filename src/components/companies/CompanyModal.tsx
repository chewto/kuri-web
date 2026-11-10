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

  // Phone sanitizer: allows only a leading '+' and digits
  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: sanitizePhone(value) }));
  };

  // Tax ID sanitizer and formatter (e.g., J-12345678-9 or J-12345678)
  const handleTaxIdChange = (value: string) => {
    // Convert to uppercase and allow tax ID prefixes (J, G, V, E, C) followed by digits and hyphens
    const upper = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, tax_id: upper }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Name
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    // 2. Tax ID
    // Valid formats: J-12345678, J-12345678-0, G-12345678-9, V-12345678, etc.,
    // or a standard alphanumeric tax ID.
    const rifRegex = /^[JGVECjgvec]-?\d{7,9}(-?\d)?$/;
    if (!formData.tax_id?.trim()) {
      newErrors.tax_id = 'Tax ID is required';
    } else if (!rifRegex.test(formData.tax_id.trim())) {
      newErrors.tax_id = 'Invalid tax ID format. Example: J-12345678-9 or J-12345678';
    }

    // 3. Industry
    if (!formData.industry?.trim()) {
      newErrors.industry = 'Industry or sector is required';
    }

    // 4. Website (a real URL with or without a protocol: domain.tld)
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
    if (!formData.website?.trim()) {
      newErrors.website = 'Website is required';
    } else if (!urlRegex.test(formData.website.trim())) {
      newErrors.website = 'Enter a valid URL (e.g., company.com or https://company.com)';
    }

    // 5. Phone: digits only, no letters. Up to 10 national digits.
    // (ignoring the country code 58 and the leading 0)
    const phoneError = validatePhone(formData.phone || '', { required: true });
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    // 6. Address
    if (!formData.address?.trim()) {
      newErrors.address = 'Tax or physical address is required';
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
        submit: error.response?.data?.message || 'Could not save the company. Check your information.',
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
                {initialData ? 'Edit Company' : 'New Company'}
              </h2>
              <p className="text-xs text-slate-500">
                {initialData ? "Update the organization's details" : 'Add a new corporate account'}
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
            label="Company name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Acme Technologies Inc."
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tax ID / Registration Number *"
              value={formData.tax_id || ''}
              onChange={(e) => handleTaxIdChange(e.target.value)}
              placeholder="e.g., J-12345678-9"
              helperText="Prefix J-, G-, V-, or E- followed by digits"
              error={errors.tax_id}
              required
            />
            <Input
              label="Industry / Sector *"
              value={formData.industry || ''}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g., Software, Retail, Food"
              error={errors.industry}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Website *"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="e.g., company.com or https://company.com"
              helperText="Valid domain (e.g., company.com)"
              error={errors.website}
              required
            />
            <Input
              label="Company phone *"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="e.g., +58 4121234567"
              helperText="Numbers only, exactly 10 digits (e.g., 4121234567)"
              error={errors.phone}
              required
            />
          </div>

          <Input
            label="Tax or physical address *"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="42 Innovation Ave, Floor 3"
            error={errors.address}
            required
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {initialData ? 'Save changes' : 'Create Company'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
