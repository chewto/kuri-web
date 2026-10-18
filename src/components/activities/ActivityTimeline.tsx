import React from 'react';
import { FileText, Phone, Mail, Calendar, Clock, User } from 'lucide-react';
import { ActivityLog, ActivityType } from '../../types/activity';

interface ActivityTimelineProps {
  activities: ActivityLog[];
  isLoading: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, isLoading }) => {
  const getTypeBadge = (type: ActivityType) => {
    switch (type) {
      case 'call':
        return {
          icon: Phone,
          label: 'Llamada',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotBg: 'bg-emerald-500',
        };
      case 'email':
        return {
          icon: Mail,
          label: 'Correo',
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dotBg: 'bg-sky-500',
        };
      case 'meeting':
        return {
          icon: Calendar,
          label: 'Reunión',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dotBg: 'bg-purple-500',
        };
      case 'note':
      default:
        return {
          icon: FileText,
          label: 'Nota',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dotBg: 'bg-amber-500',
        };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600"></div>
        <p className="mt-2 text-xs text-slate-500">Cargando historial de actividades...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <Clock className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-semibold text-slate-700">Sin actividades registradas</h4>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
          Usa el formulario superior para añadir la primera llamada, correo, minuta o nota de este contacto.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="w-4 h-4 text-emerald-600" />
        <span>Línea de Tiempo de Interacciones</span>
        <span className="ml-auto text-xs font-normal text-slate-400">
          {activities.length} {activities.length === 1 ? 'registro' : 'registros'}
        </span>
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {activities.map((activity) => {
          const config = getTypeBadge(activity.type);
          const Icon = config.icon;

          return (
            <div key={activity.id} className="relative group">
              {/* Timeline marker */}
              <div
                className={`absolute -left-[29px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${config.dotBg} shadow-sm`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Card content */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 transition-all hover:bg-slate-50 hover:border-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${config.bg}`}
                    >
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                    {activity.user_email && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        {activity.user_email}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(activity.created_at)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {activity.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
