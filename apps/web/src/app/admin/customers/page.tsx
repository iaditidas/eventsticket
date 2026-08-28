'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/api';
import BackButton from '../../../components/BackButton';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => fetchApi<{ customers: any[] }>('/admin/customers'),
  });

  const customers = data?.data?.customers || [];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <BackButton href="/admin" label="Back to Dashboard" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Customer Roster</h1>
          <p className="text-slate-500 text-sm mt-1">Directory of registered customers and lifetime spending stats.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
          />
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
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Confirmed Bookings</th>
                  <th className="p-4 text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{c.name}</td>
                    <td className="p-4 text-xs text-slate-500">{c.email}</td>
                    <td className="p-4 text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-slate-800">{c.totalBookings}</td>
                    <td className="p-4 text-right font-black text-emerald-600">₹{c.totalSpend.toFixed(2)}</td>
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
