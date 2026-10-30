import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, DollarSign, TrendingUp, X } from 'lucide-react';
import { Company } from '../../types/company';
import { Contact } from '../../types/contact';
import { Deal, DealFormData, DealStatus } from '../../types/deal';
import { Stage } from '../../types/stage';
import { getContacts } from '../../services/contactService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DealFormData) => Promise<void>;
  initialData?: Deal | null;
  stages: Stage[];
  companies: Company[];
}

interface DealFormState {
  title: string;
  value: string;
  company_id: string;
  contact_id: string;
  stage_id: string;
  expected_close_date: string;
  status: DealStatus;
}

const buildInitialForm = (initialData: Deal | null | undefined, stages: Stage[]): DealFormState => ({
  title: initialData?.title ?? '',
  value: initialData ? String(initialData.value) : '',
  company_id: initialData?.company_id ?? '',
  contact_id: initialData?.contact_id ?? '',
  stage_id: initialData?.stage_id ?? stages[0]?.id ?? '',
  expected_close_date: initialData?.expected_close_date?.slice(0, 10) ?? '',
  status: initialData?.status ?? 'open',
});

const getContactLabel = (contact: Contact): string => {
  const fullName = `${contact.first_name} ${contact.last_name ?? ''}`.trim();
  return contact.email ? `${fullName} · ${contact.email}` : fullName;
};

const selectClassName =
  'block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 shadow-sm transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  stages,
  companies,
}) => {
  const [formData, setFormData] = useState<DealFormState>(() =>
    buildInitialForm(initialData, stages)
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Reinicia el formulario cada vez que se abre el modal.
  useEffect(() => {
    if (!isOpen) return;

    setFormData(buildInitialForm(initialData, stages));
    setContacts([]);
    setContactError(null);
    setErrors({});
    setIsSubmitting(false);
    // `stages` solo se usa para el valor inicial al abrir; no debe resetear el
    // formulario si el tablero se refresca con el modal abierto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  // Asegura una etapa por defecto si las etapas llegan después de abrir.
  useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) =>
      prev.stage_id || stages.length === 0 ? prev : { ...prev, stage_id: stages[0].id }
    );
  }, [isOpen, stages]);

  // Carga los contactos de la empresa seleccionada.
  useEffect(() => {
    if (!isOpen || !formData.company_id) {
      setContacts([]);
      setContactError(null);
      setIsLoadingContacts(false);
      return;
    }

    let cancelled = false;
    setIsLoadingContacts(true);
    setContactError(null);

    getContacts({ company_id: formData.company_id, per_page: 100 })
      .then((result) => {
        if (!cancelled) setContacts(result.items);
      })
      .catch(() => {
        if (!cancelled) {
          setContacts([]);
          setContactError('No se pudieron cargar los contactos de esta empresa.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingContacts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, formData.company_id]);

  // Bloquea el scroll del documento y gestiona el foco al abrir/cerrar.
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 40);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      previousActiveElementRef.current?.focus?.();
    };
  }, [isOpen]);

  // Escape para cerrar y trampa de tabulación dentro del diálogo.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!isSubmitting) {
          event.preventDefault();
          onClose();
        }
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const selectedContactFallback =
    formData.contact_id && !contacts.some((contact) => contact.id === formData.contact_id)
      ? {
          id: formData.contact_id,
          label: initialData?.contact_name || 'Contacto actual',
        }
      : null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const title = formData.title.trim();

    if (!title) {
      newErrors.title = 'El título de la oportunidad es obligatorio';
    } else if (title.length > 120) {
      newErrors.title = 'El título no puede superar los 120 caracteres';
    }

    if (!formData.company_id) {
      newErrors.company_id = 'Selecciona una empresa';
    }

    if (!formData.stage_id) {
      newErrors.stage_id = 'Selecciona una etapa';
    }

    const numericValue = Number(formData.value);
    if (formData.value.trim() === '' || !Number.isFinite(numericValue) || numericValue < 0) {
      newErrors.value = 'Ingresa un valor numérico mayor o igual a 0';
    }

    if (
      formData.expected_close_date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.expected_close_date)
    ) {
      newErrors.expected_close_date = 'Ingresa una fecha de cierre válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setErrors({});
      await onSubmit({
        title: formData.title.trim(),
        company_id: formData.company_id,
        contact_id: formData.contact_id || null,
        stage_id: formData.stage_id,
        value: Number(formData.value),
        expected_close_date: formData.expected_close_date || null,
        status: formData.status,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrors({
        submit:
          error.response?.data?.message ||
          'Error al guardar la oportunidad. Revisa los datos e inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-modal-title"
        aria-describedby="deal-modal-description"
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 id="deal-modal-title" className="text-base font-bold text-slate-800">
                {initialData ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
              </h2>
              <p id="deal-modal-description" className="text-xs text-slate-500">
                {initialData
                  ? 'Actualiza los datos comerciales del trato'
                  : 'Registra una nueva oportunidad en el pipeline de ventas'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-8rem)] space-y-4 overflow-y-auto p-6">
          {errors.submit && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {errors.submit}
            </div>
          )}

          {companies.length === 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                No hay empresas registradas. Crea una empresa primero para poder asociar la
                oportunidad.{' '}
                <Link to="/companies" onClick={onClose} className="font-semibold underline">
                  Ir a Empresas
                </Link>
              </span>
            </div>
          )}

          <Input
            ref={titleInputRef}
            name="title"
            label="Título de la oportunidad *"
            value={formData.title}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="Ej: Implementación CRM Enterprise"
            maxLength={120}
            error={errors.title}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="value"
              label="Valor ($) *"
              type="number"
              min={0}
              step="0.01"
              value={formData.value}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, value: event.target.value }))
              }
              placeholder="0.00"
              leftIcon={<DollarSign className="h-4 w-4" />}
              error={errors.value}
              required
            />

            <div>
              <label
                htmlFor="deal-company"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Empresa asociada *
              </label>
              <select
                id="deal-company"
                value={formData.company_id}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    company_id: event.target.value,
                    contact_id: '',
                  }))
                }
                aria-invalid={Boolean(errors.company_id)}
                className={selectClassName}
                disabled={companies.length === 0}
                required
              >
                <option value="">
                  {companies.length === 0 ? 'Sin empresas registradas' : 'Selecciona una empresa'}
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.company_id && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.company_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="deal-contact"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Contacto asociado
              </label>
              <select
                id="deal-contact"
                value={formData.contact_id}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, contact_id: event.target.value }))
                }
                className={selectClassName}
                disabled={!formData.company_id || isLoadingContacts}
              >
                <option value="">
                  {!formData.company_id
                    ? 'Selecciona una empresa primero'
                    : isLoadingContacts
                      ? 'Cargando contactos...'
                      : contacts.length === 0
                        ? 'Sin contactos registrados'
                        : 'Sin contacto asignado'}
                </option>
                {selectedContactFallback && (
                  <option value={selectedContactFallback.id}>{selectedContactFallback.label}</option>
                )}
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {getContactLabel(contact)}
                  </option>
                ))}
              </select>
              {contactError ? (
                <p className="mt-1.5 text-xs font-medium text-rose-600">{contactError}</p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-500">
                  Opcional. Se muestran los contactos de la empresa seleccionada.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="deal-stage"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                {initialData ? 'Etapa' : 'Etapa inicial'} *
              </label>
              <select
                id="deal-stage"
                value={formData.stage_id}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, stage_id: event.target.value }))
                }
                aria-invalid={Boolean(errors.stage_id)}
                className={selectClassName}
                disabled={stages.length === 0}
                required
              >
                <option value="">
                  {stages.length === 0 ? 'Sin etapas configuradas' : 'Selecciona una etapa'}
                </option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name} ({stage.probability}%)
                  </option>
                ))}
              </select>
              {errors.stage_id && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.stage_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="expected_close_date"
              label="Fecha prevista de cierre"
              type="date"
              value={formData.expected_close_date}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, expected_close_date: event.target.value }))
              }
              error={errors.expected_close_date}
            />

            <div>
              <label
                htmlFor="deal-status"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Estado
              </label>
              <select
                id="deal-status"
                value={formData.status}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: event.target.value as DealStatus,
                  }))
                }
                className={selectClassName}
              >
                <option value="open">Abierto</option>
                <option value="won">Ganado</option>
                <option value="lost">Perdido</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                Al arrastrar en el tablero, el estado se ajusta según la etapa.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {initialData ? 'Actualizar Oportunidad' : 'Crear Oportunidad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
