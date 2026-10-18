import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  RefreshCw,
  Edit2,
} from 'lucide-react';
import { Contact, ContactFormData } from '../types/contact';
import { ActivityLog, ActivityFormData } from '../types/activity';
import { Company } from '../types/company';
import { getContactById, updateContact } from '../services/contactService';
import { getAllCompanies } from '../services/companyService';
import { getContactActivities, createActivity } from '../services/activityService';
import { AddActivityForm } from '../components/activities/AddActivityForm';
import { ActivityTimeline } from '../components/activities/ActivityTimeline';
import { ContactModal } from '../components/contacts/ContactModal';
import { Button } from '../components/common/Button';

export const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  const loadContactData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setErrorNotification(null);
      const [contactData, activitiesData, companiesData] = await Promise.all([
        getContactById(id),
        getContactActivities(id),
        getAllCompanies(),
      ]);
      setContact(contactData);
      setActivities(activitiesData);
      setCompanies(companiesData);
    } catch {
      setErrorNotification('No se pudo cargar la información del contacto.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadContactData();
  }, [loadContactData]);

  const handleAddActivity = async (data: ActivityFormData) => {
    if (!id) return;
    const newActivity = await createActivity(id, data);
    setActivities((prev) => [newActivity, ...prev]);
  };

  const handleUpdateContact = async (formData: ContactFormData) => {
    if (!id) return;
    const updated = await updateContact(id, formData);
    setContact(updated);
    await loadContactData();
  };

  if (isLoading && !contact) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <p className="mt-3 text-sm text-slate-500">Cargando expediente del contacto...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
        <h3 className="text-base font-bold text-slate-800">Contacto no encontrado</h3>
        <p className="text-xs text-slate-500 mt-2">
          El contacto solicitado no existe o fue eliminado de la base de datos.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/contacts')} className="mt-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al directorio</span>
        </Button>
      </div>
    );
  }

  const fullName = `${contact.first_name} ${contact.last_name ?? ''}`.trim();
  const initials = `${contact.first_name?.[0] ?? ''}${contact.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/contacts')}
            className="h-9 w-9 p-0"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Ficha de Contacto
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-400">ID: {contact.id.slice(0, 8)}...</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadContactData}
            disabled={isLoading}
            title="Recargar"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
            <Edit2 className="w-4 h-4" />
            <span>Editar Contacto</span>
          </Button>
        </div>
      </div>

      {errorNotification && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
          <span>{errorNotification}</span>
          <button
            onClick={() => setErrorNotification(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid Layout: 1/3 Profile Info, 2/3 Interactions Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-full bg-slate-900 text-emerald-400 border-2 border-emerald-500/30 flex items-center justify-center text-2xl font-bold mb-3 shadow-md">
                {initials || 'CT'}
              </div>
              <h2 className="text-lg font-bold text-slate-800">{fullName}</h2>
              {contact.position && (
                <p className="text-xs font-medium text-slate-500 mt-0.5">{contact.position}</p>
              )}
              {contact.company ? (
                <div className="mt-3">
                  <Link
                    to="/companies"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{contact.company.name}</span>
                  </Link>
                </div>
              ) : (
                <span className="mt-3 inline-block text-[11px] text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Sin empresa asignada
                </span>
              )}
            </div>

            {/* Contact Information List */}
            <div className="pt-6 space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Datos de Comunicación
              </h4>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Correo</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline truncate block"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Teléfono</p>
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-xs font-medium text-slate-700 hover:text-emerald-600 truncate block"
                    >
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No especificado</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Cargo</p>
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {contact.position || 'Sin cargo'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Fecha de Creación</p>
                  <p className="text-xs font-medium text-slate-600">
                    {new Date(contact.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Add Activity Form + Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <AddActivityForm onSubmit={handleAddActivity} />
          <ActivityTimeline activities={activities} isLoading={isLoading} />
        </div>
      </div>

      {/* Edit Modal */}
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUpdateContact}
        initialData={contact}
        companies={companies}
      />
    </div>
  );
};
export default ContactDetailPage;
