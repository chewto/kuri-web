import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Building2, RefreshCw } from 'lucide-react';
import { Company, CompanyFormData } from '../types/company';
import { getCompaniesPage, createCompany, updateCompany, deleteCompany } from '../services/companyService';
import { CompanyTable } from '../components/companies/CompanyTable';
import { CompanyModal } from '../components/companies/CompanyModal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, per_page: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorNotification(null);
      const data = await getCompaniesPage({ search: searchTerm || undefined, page });
      setCompanies(data.items);
      setPagination({ total: data.total, pages: data.pages, per_page: data.per_page });
      if (data.pages > 0 && page > data.pages) {
        setPage(data.pages);
      }
    } catch {
      setErrorNotification('Could not load companies. Check your connection to the server.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchCompanies]);

  const handleCreateOrUpdate = async (formData: CompanyFormData) => {
    if (selectedCompany) {
      await updateCompany(selectedCompany.id, formData);
    } else {
      await createCompany(formData);
    }
    await fetchCompanies();
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };

  const handleDelete = async (company: Company) => {
    const confirmed = window.confirm(
      `Delete the company "${company.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteCompany(company.id);
      await fetchCompanies();
    } catch {
      alert('Could not delete the company.');
    }
  };

  const handleOpenNew = () => {
    setSelectedCompany(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Company Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage corporate accounts, industries, and tax details for your B2B clients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCompanies}
            disabled={isLoading}
            title="Reload data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="primary" size="md" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" />
            <span>New Company</span>
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

      {/* Toolbar / Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-center">
          Total: <strong className="text-slate-800">{pagination.total}</strong> companies
        </div>
      </div>

      {/* Table */}
      <CompanyTable
        companies={companies}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
      <CompanyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedCompany}
      />
    </div>
  );
};
export default CompaniesPage;
