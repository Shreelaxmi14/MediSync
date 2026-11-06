import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Volume2,
  Clock,
  Shield,
  Check
} from 'lucide-react';
import { PatientProfile, NotificationItem } from '../../types';
import { storageService } from '../../services/storageService';

interface PatientNotificationsProps {
  patient: PatientProfile;
}

export const PatientNotifications: React.FC<PatientNotificationsProps> = ({ patient }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    storageService.getNotifications(patient.userId)
  );
  const [browserPermStatus, setBrowserPermStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [testChimePlaying, setTestChimePlaying] = useState(false);

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermStatus(perm);
        if (perm === 'granted') {
          new Notification('MediSync Reminders Active', {
            body: 'You will receive timely reminders for your scheduled medication doses.',
            icon: '/favicon.ico',
          });
        }
      } catch (e) {
        console.error('Browser notification error:', e);
      }
    }
  };

  const playTestChime = () => {
    setTestChimePlaying(true);
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio fallback safely ignored
    }
    setTimeout(() => setTestChimePlaying(false), 500);
  };

  const markAllRead = () => {
    storageService.markAllNotificationsAsRead(patient.userId);
    setNotifications(storageService.getNotifications(patient.userId));
  };

  const markOneRead = (id: string) => {
    storageService.markNotificationAsRead(id);
    setNotifications(storageService.getNotifications(patient.userId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Alerts & Communications
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dose reminders, caregiver messages, and adherence notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={playTestChime}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Volume2 className={`w-3.5 h-3.5 ${testChimePlaying ? 'text-teal-600 animate-pulse' : 'text-slate-500'}`} />
            <span>Test Reminder Chime</span>
          </button>
          <button
            onClick={markAllRead}
            className="px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Browser Notification Permission Banner */}
      {browserPermStatus !== 'granted' && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Enable Browser Dose Reminders</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Never miss scheduled medication times even when MediSync is running in a background tab.
              </p>
            </div>
          </div>
          <button
            onClick={requestBrowserPermission}
            className="px-4 py-2 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl transition-colors shrink-0"
          >
            Enable Reminders
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>You have no recent notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(item => {
              const isCheer = item.type === 'cheer';
              const isMissed = item.type === 'missed_dose';

              return (
                <div
                  key={item.id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    !item.isRead ? 'bg-teal-50/20' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCheer
                          ? 'bg-rose-50 text-rose-600'
                          : isMissed
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-teal-50 text-teal-700'
                      }`}
                    >
                      {isCheer ? (
                        <Heart className="w-4 h-4" />
                      ) : isMissed ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={() => markOneRead(item.id)}
                      className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
