import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Check,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { CaregiverProfile, NotificationItem } from '../../types';
import { storageService } from '../../services/storageService';

interface CaregiverAlertsProps {
  caregiver: CaregiverProfile;
}

export const CaregiverAlerts: React.FC<CaregiverAlertsProps> = ({ caregiver }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    storageService.getNotifications(caregiver.userId)
  );

  const filtered = notifications.filter(item => {
    if (filterType === 'unread') return !item.isRead;
    if (filterType === 'missed') return item.type === 'missed_dose';
    if (filterType === 'alerts') return item.type === 'caregiver_alert';
    return true;
  });

  const handleAcknowledge = (id: string) => {
    storageService.markNotificationAsRead(id);
    setNotifications(storageService.getNotifications(caregiver.userId));
  };

  const handleAcknowledgeAll = () => {
    storageService.markAllNotificationsAsRead(caregiver.userId);
    setNotifications(storageService.getNotifications(caregiver.userId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Surveillance Center
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Alerts & Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time critical events for missed doses and unconfirmed medication windows
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAcknowledgeAll}
            className="px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
          >
            Acknowledge All Alerts
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {[
            { key: 'all', label: 'All Events' },
            { key: 'unread', label: 'Unacknowledged' },
            { key: 'missed', label: 'Missed Doses' },
            { key: 'alerts', label: 'Pattern Alerts' },
          ].map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterType === f.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-mono">
          {filtered.length} {filtered.length === 1 ? 'alert' : 'alerts'}
        </span>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">All alerts acknowledged</p>
            <p className="text-slate-400 mt-0.5">No critical notifications match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(alert => (
              <div
                key={alert.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  !alert.isRead ? 'bg-amber-50/25' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !alert.isRead ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{alert.title}</h4>
                      {!alert.isRead && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Unacknowledged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!alert.isRead && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Acknowledge</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
