import React, { useState, useEffect } from 'react';
import { X, Plus, Palette, Tag } from 'lucide-react';
import { Category, CategoryFormData } from '../../types/category';
import { getCategories, createCategory } from '../../services/categoryService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: (newCategory: Category) => void;
}

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#64748B', // Slate
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  onCategoryCreated,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCategoryList = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch {
      setErrorMessage('No se pudieron cargar las categorías existentes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setName('');
      setColor(PRESET_COLORS[0]);
      setErrorMessage(null);
      fetchCategoryList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('El nombre de la categoría es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const payload: CategoryFormData = {
        name: name.trim(),
        color,
      };
      const res = await createCategory(payload);
      setName('');
      await fetchCategoryList();
      if (onCategoryCreated) {
        onCategoryCreated(res.category);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        error.response?.data?.message || 'Error al registrar la categoría.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Categorías Financieras
              </h2>
              <p className="text-xs text-slate-500">
                Clasifica suscripciones SaaS y movimientos de caja
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Form to create */}
          <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Añadir Nueva Categoría
            </span>
            <Input
              label="Nombre *"
              placeholder="Ej: Hosting & Cloud, Marketing, Nómina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                Color de Etiqueta
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c
                        ? 'ring-2 ring-offset-2 ring-slate-800 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Categoría</span>
            </Button>
          </form>

          {/* List of existing categories */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Categorías Existentes ({categories.length})
            </span>
            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Cargando categorías...
              </div>
            ) : categories.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 italic">
                Aún no has creado categorías. Añade una arriba.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-100">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between py-2.5 px-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cat.color}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
export default CategoryManagerModal;
