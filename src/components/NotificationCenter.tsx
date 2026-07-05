import React from "react";
import { NotificationRecord } from "../types";
import { Bell, X, Calendar, Flame, AlertCircle, CheckCircle, MailOpen } from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationRecord[];
  onMarkAsRead: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs">
      {/* Tap outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-saffron-100 bg-saffron-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-saffron-600" />
            <h3 className="font-display font-semibold text-gray-900">Divine Updates</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of alerts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-full bg-saffron-50 flex items-center justify-center text-saffron-400 mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-gray-700">All Quiet</h4>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                You're up to date! Future booking receipts and temple announcements will show up here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              // Icon mapping based on notification type
              let Icon = Bell;
              let iconColor = "text-saffron-500 bg-saffron-50";
              if (notif.type === "booking" || notif.type === "reminder") {
                Icon = Calendar;
                iconColor = "text-emerald-500 bg-emerald-50";
              } else if (notif.type === "festival") {
                Icon = Flame;
                iconColor = "text-amber-500 bg-amber-50";
              } else if (notif.type === "cancellation") {
                Icon = AlertCircle;
                iconColor = "text-rose-500 bg-rose-50";
              }

              return (
                <div 
                  key={notif.notificationId}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 relative ${
                    notif.read 
                      ? "bg-gray-50/50 border-gray-100 text-gray-600" 
                      : "bg-saffron-50/20 border-saffron-100/70 shadow-sm"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 pr-6">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`text-xs font-bold leading-tight ${notif.read ? "text-gray-800" : "text-saffron-950"}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="block text-[9px] text-gray-400 font-sans">
                        {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.time).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Mark as read button */}
                  {!notif.read && (
                    <button
                      onClick={() => onMarkAsRead(notif.notificationId)}
                      className="absolute top-3.5 right-3.5 p-1 text-saffron-500 hover:text-saffron-700 hover:bg-saffron-50 rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <MailOpen className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
