import React from 'react';
import { Mail, Phone, Building2, User, ArrowUpRight, Edit2, Trash2 } from 'lucide-react';
import { Contact } from '../../types/contact';
import { Button } from '../common/Button';

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onSelect: (contactId: string) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  isLoading,
  onEdit,
  onDelete,
  onSelect,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-sm text-slate-500">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No se encontraron contactos</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Comienza creando un contacto o ajusta los filtros de búsqueda y empresa.
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
              <th className="py-3.5 px-4">Contacto</th>
              <th className="py-3.5 px-4">Cargo / Posición</th>
              <th className="py-3.5 px-4">Empresa</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Teléfono</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((contact) => {
              const fullName = `${contact.first_name} ${contact.last_name ?? ''}`.trim();
              const initials = `${contact.first_name?.[0] ?? ''}${contact.last_name?.[0] ?? ''}`.toUpperCase();

              return (
                <tr
                  key={contact.id}
                  className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  onClick={() => onSelect(contact.id)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {initials || 'CT'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {fullName}
                          </p>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-slate-400">ID: {contact.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {contact.position ? (
                      <span className="text-xs text-slate-700 font-medium">{contact.position}</span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {contact.company ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        {contact.company.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Sin empresa</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <a
                      href={`mailto:${contact.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{contact.email}</span>
                    </a>
                  </td>
                  <td className="py-3.5 px-4">
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs italic">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(contact)}
                        className="text-slate-500 hover:text-slate-700 h-8 w-8 p-0"
                        title="Editar contacto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(contact)}
                        className="text-slate-400 hover:text-rose-600 h-8 w-8 p-0"
                        title="Eliminar contacto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
