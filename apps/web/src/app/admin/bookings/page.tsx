'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/api';
import BackButton from '../../../components/BackButton';
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
      <BackButton href="/admin" label="Back to Dashboard" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Master Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">Audit customer bookings and manage manual cancellations & refunds.</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none shadow-xs"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-400">{b.id.substring(0, 8)}...</td>
                    <td className="p-4 font-bold text-slate-900">
                      {b.user?.name}
                      <span className="block text-xs text-slate-500 font-normal">{b.user?.email}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{b.event?.title}</td>
                    <td className="p-4 font-extrabold text-indigo-600">${b.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : b.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
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
