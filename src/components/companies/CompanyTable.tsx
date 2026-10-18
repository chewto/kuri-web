import React from 'react';
import { Building2, Globe, Phone, Edit2, Trash2, Hash } from 'lucide-react';
import { Company } from '../../types/company';
import { Button } from '../common/Button';

interface CompanyTableProps {
  companies: Company[];
  isLoading: boolean;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-sm text-slate-500">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No se encontraron empresas</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Comienza registrando tu primera empresa cliente o ajusta el criterio de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3.5 px-4">Empresa</th>
              <th className="py-3.5 px-4">Tax ID / CIF</th>
              <th className="py-3.5 px-4">Industria</th>
              <th className="py-3.5 px-4">Sitio Web</th>
              <th className="py-3.5 px-4">Teléfono</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-100">
                      {company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{company.name}</p>
                      {company.address && (
                        <p className="text-xs text-slate-400 truncate max-w-xs">{company.address}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  {company.tax_id ? (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      <Hash className="w-3 h-3 text-slate-400" />
                      {company.tax_id}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {company.industry ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {company.industry}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {company.website ? (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[150px]">{company.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs italic">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {company.phone ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {company.phone}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(company)}
                      className="text-slate-500 hover:text-slate-700 h-8 w-8 p-0"
                      title="Editar empresa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(company)}
                      className="text-slate-400 hover:text-rose-600 h-8 w-8 p-0"
                      title="Eliminar empresa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
