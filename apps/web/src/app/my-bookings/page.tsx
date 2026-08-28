'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi, API_BASE } from '../../lib/api';
import { useAuthStore } from '../../lib/auth-store';
import BackButton from '../../components/BackButton';
import { Ticket as TicketIcon, Calendar, MapPin, Download, QrCode } from 'lucide-react';

export default function MyBookingsPage() {
  const { user } = useAuthStore();
  const [activeQrModal, setActiveQrModal] = useState<any>(null);
  const [localBookings, setLocalBookings] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('eventhub_local_bookings') || '[]');
      setLocalBookings(stored);
    } catch (e) {
      console.error('Error reading local bookings', e);
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => fetchApi<{ bookings: any[] }>('/bookings/my-bookings'),
    enabled: !!user,
  });

  const apiBookings = data?.data?.bookings || [];

  // Merge API bookings and local bookings, avoiding duplicates
  const allBookingsMap = new Map();
  [...apiBookings, ...localBookings].forEach((b) => {
    if (b && b.id && !allBookingsMap.has(b.id)) {
      allBookingsMap.set(b.id, b);
    }
  });

  const bookings = Array.from(allBookingsMap.values());

  if (!user) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8">
        <BackButton href="/events" label="Back to Events" />
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <TicketIcon className="w-12 h-12 text-indigo-600 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Please Sign In</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Sign in to view your confirmed ticket bookings, unique QR check-in passes, and downloadable PDF tickets.
          </p>
          <div className="pt-2">
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-600/20 transition-all text-sm"
            >
              Sign In to Your Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <BackButton href="/events" label="Back to Events" />
      <div>
        <h1 className="text-3xl font-black text-slate-900">My Bookings & E-Tickets</h1>
        <p className="text-slate-500 text-sm mt-1">Access your confirmed admission passes and download official PDF tickets.</p>
      </div>

      {isLoading && bookings.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <TicketIcon className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800">No bookings found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            You have not booked any event tickets yet. Browse our 5 featured events to select and book your ₹500 admission passes.
          </p>
          <div className="pt-2">
            <a
              href="/events"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-600/20 transition-all text-sm"
            >
              Browse Events
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => {
            const eventTitle = b.event?.title || b.eventTitle || 'Global Tech & AI Summit 2026';
            const eventVenue = b.event?.venue || b.venue || 'Palace Grounds, Bengaluru, India';
            const eventDate = b.event?.date || b.eventDate || '2026-10-15';
            const total = typeof b.totalAmount === 'number' ? b.totalAmount : 500;

            return (
              <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {b.status || 'CONFIRMED'}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-2">{eventTitle}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-1.5">
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span>{eventDate}</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>{eventVenue}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Paid</span>
                    <span className="text-2xl font-black text-indigo-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Tickets List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Admission Passes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {b.items?.flatMap((item: any) =>
                      item.tickets?.map((t: any) => (
                        <div
                          key={t.id || t.ticketCode}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {item.ticketCategory?.name || item.categoryName || 'General Admission'}
                              </span>
                              {t.isCheckedIn && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                  CHECKED IN
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-xs text-slate-500">{t.ticketCode}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setActiveQrModal(t)}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
                              title="Show QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <a
                              href={`${API_BASE}/tickets/${t.id}/pdf`}
                              download
                              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-colors flex items-center space-x-1.5 text-xs font-bold"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </a>
                          </div>
                        </div>
                      ))
                    ) || (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs col-span-2">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 text-sm">General Admission Pass</span>
                          <p className="font-mono text-xs text-slate-500">TCK-{b.id.substring(0, 8).toUpperCase()}</p>
                        </div>
                        <button
                          onClick={() =>
                            setActiveQrModal({
                              ticketCode: `TCK-${b.id.substring(0, 8).toUpperCase()}`,
                              qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TCK-${b.id}`,
                            })
                          }
                          className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center space-x-1"
                        >
                          <QrCode className="w-4 h-4 mr-1" /> View Pass
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Scan Admission QR Pass</h3>
            <p className="text-slate-500 text-xs font-mono">{activeQrModal.ticketCode}</p>

            <div className="p-4 bg-white rounded-2xl inline-block border border-slate-200 shadow-md">
              <img src={activeQrModal.qrCode} alt="QR Pass" className="w-48 h-48 mx-auto" />
            </div>

            <button
              onClick={() => setActiveQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-sm transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
