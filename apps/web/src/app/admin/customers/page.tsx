'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/api';
import { Users, Search, DollarSign } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Customer Roster</h1>
          <p className="text-slate-400 text-sm mt-1">Directory of registered customers and lifetime spending stats.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
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
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Confirmed Bookings</th>
                  <th className="p-4 text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white">{c.name}</td>
                    <td className="p-4 text-xs text-slate-400">{c.email}</td>
                    <td className="p-4 text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-slate-200">{c.totalBookings}</td>
                    <td className="p-4 text-right font-black text-emerald-400">${c.totalSpend.toFixed(2)}</td>
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
