import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, RefreshCw, Filter } from 'lucide-react';
import { Contact, ContactFormData } from '../types/contact';
import { Company } from '../types/company';
import { getContacts, createContact, updateContact, deleteContact } from '../services/contactService';
import { getAllCompanies } from '../services/companyService';
import { ContactTable } from '../components/contacts/ContactTable';
import { ContactModal } from '../components/contacts/ContactModal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';

export const ContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, per_page: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorNotification(null);
      const [contactsData, companiesData] = await Promise.all([
        getContacts({
          search: searchTerm || undefined,
          company_id: selectedCompanyId || undefined,
          page,
        }),
        getAllCompanies(),
      ]);
      setContacts(contactsData.items);
      setCompanies(companiesData);
      setPagination({
        total: contactsData.total,
        pages: contactsData.pages,
        per_page: contactsData.per_page,
      });
      if (contactsData.pages > 0 && page > contactsData.pages) {
        setPage(contactsData.pages);
      }
    } catch {
      setErrorNotification('Could not load contacts. Check your connection to the server.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCompanyId, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCompanyId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleCreateOrUpdate = async (formData: ContactFormData) => {
    if (selectedContact) {
      await updateContact(selectedContact.id, formData);
    } else {
      await createContact(formData);
    }
    await loadData();
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setModalOpen(true);
  };

  const handleDelete = async (contact: Contact) => {
    const fullName = `${contact.first_name} ${contact.last_name ?? ''}`.trim();
    const confirmed = window.confirm(
      `Delete the contact "${fullName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteContact(contact.id);
      await loadData();
    } catch {
      alert('Could not delete the contact.');
    }
  };

  const handleSelect = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const handleOpenNew = () => {
    setSelectedContact(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Contact Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage stakeholders and buying decision-makers while keeping your B2B relationship
            history in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            title="Reload data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="primary" size="md" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" />
            <span>New Contact</span>
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

      {/* Toolbar / Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by name, email, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="relative w-full sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">All companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 self-end sm:self-center">
          Total: <strong className="text-slate-800">{pagination.total}</strong> contacts
        </div>
      </div>

      {/* Table */}
      <ContactTable
        contacts={contacts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelect={handleSelect}
      />

      <Pagination
        page={page}
        pages={pagination.pages}
        total={pagination.total}
        perPage={pagination.per_page}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Modal Form */}
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedContact}
        companies={companies}
      />
    </div>
  );
};
export default ContactsPage;
