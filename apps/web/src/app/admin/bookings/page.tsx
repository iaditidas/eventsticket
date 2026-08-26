'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/api';
import { ShoppingBag, XCircle, Search } from 'lucide-react';
import { useState } from 'react';

export default function MasterBookingsPage() {
  const [filterStatus, setFilterStatus] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-bookings', filterStatus],
    queryFn: async () => {
      const param = filterStatus ? `?status=${filterStatus}` : '';
      return fetchApi<{ bookings: any[] }>(`/admin/bookings${param}`);
    },
  });

  const bookings = data?.data?.bookings || [];

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking and release capacity back to inventory?')) return;
    await fetchApi(`/admin/bookings/${id}/cancel`, { method: 'POST' });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Master Bookings</h1>
          <p className="text-slate-400 text-sm mt-1">Audit customer bookings and manage manual cancellations & refunds.</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 glass-card rounded-2xl animate-pulse" />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-400">{b.id.substring(0, 8)}...</td>
                    <td className="p-4 font-semibold text-white">
                      {b.user?.name}
                      <span className="block text-xs text-slate-500 font-normal">{b.user?.email}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{b.event?.title}</td>
                    <td className="p-4 font-bold text-indigo-400">${b.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : b.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
                        >
                          Refund & Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
