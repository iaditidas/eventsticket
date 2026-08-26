'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import { useAuthStore } from '../../lib/auth-store';
import { Ticket as TicketIcon, Calendar, MapPin, Download, QrCode, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function MyBookingsPage() {
  const { user } = useAuthStore();
  const [activeQrModal, setActiveQrModal] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => fetchApi<{ bookings: any[] }>('/bookings/my-bookings'),
    enabled: !!user,
  });

  const bookings = data?.data?.bookings || [];
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

  if (!user) {
    return <div className="text-center py-20 text-slate-400">Please sign in to view your bookings.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">My Bookings & E-Tickets</h1>
        <p className="text-slate-400 text-sm mt-1">Access your confirmed admission passes and download official PDF tickets.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl glass-card animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <TicketIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No bookings found</h3>
          <p className="text-slate-500 text-xs">Browse upcoming events to book your first admission ticket.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => (
            <div key={b.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {b.status}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">{b.event?.title}</h2>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{b.event?.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{b.event?.venue}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Paid</span>
                  <span className="text-2xl font-black text-indigo-400">${b.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admission Passes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {b.items?.map((item: any) =>
                    item.tickets?.map((t: any) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{item.ticketCategory?.name}</span>
                            {t.isCheckedIn && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400">
                                CHECKED IN
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-slate-400">{t.ticketCode}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setActiveQrModal(t)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Show QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <a
                            href={`${API_BASE}/tickets/${t.id}/pdf`}
                            download
                            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-colors flex items-center space-x-1 text-xs font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-3xl border border-slate-700 max-w-sm w-full text-center space-y-4">
            <h3 className="text-lg font-bold text-white">Scan Admission QR Pass</h3>
            <p className="text-slate-400 text-xs font-mono">{activeQrModal.ticketCode}</p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl">
              <img src={activeQrModal.qrCode} alt="QR Pass" className="w-48 h-48 mx-auto" />
            </div>

            <button
              onClick={() => setActiveQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-sm"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
