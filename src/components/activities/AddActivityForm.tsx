import React, { useState } from 'react';
import { FileText, Phone, Mail, Calendar, Send } from 'lucide-react';
import { ActivityFormData, ActivityType } from '../../types/activity';
import { Button } from '../common/Button';

interface AddActivityFormProps {
  onSubmit: (data: ActivityFormData) => Promise<void>;
}

export const AddActivityForm: React.FC<AddActivityFormProps> = ({ onSubmit }) => {
  const [type, setType] = useState<ActivityType>('note');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typesConfig: { type: ActivityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { type: 'note', label: 'Note', icon: FileText },
    { type: 'call', label: 'Call', icon: Phone },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'meeting', label: 'Meeting', icon: Calendar },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please enter a description for the activity log.');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await onSubmit({ type, content: description.trim() });
      setDescription('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Could not log the activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-3">Log New Interaction</h3>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {typesConfig.map((item) => {
          const Icon = item.icon;
          const isSelected = type === item.type;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => setType(item.type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              type === 'note'
                ? 'Details or notes about the conversation...'
                : type === 'call'
                ? 'Summary of the call made or received...'
                : type === 'email'
                ? 'Summary or notes about the email sent...'
                : 'Meeting minutes or agreed action items...'
            }
            className="w-full rounded-lg border border-slate-300 text-sm p-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-colors"
          />
          {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            It will be saved immediately to the contact's timeline.
          </span>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            <Send className="w-3.5 h-3.5" />
            <span>Save activity</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
