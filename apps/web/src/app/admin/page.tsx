'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import BackButton from '../../components/BackButton';
import { DollarSign, Calendar, Ticket, ShoppingBag, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => fetchApi<any>('/admin/analytics'),
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <BackButton href="/events" label="Back to Main Site" />
        <div className="h-96 bg-white border border-slate-200 rounded-3xl animate-pulse shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton href="/events" label="Back to Main Site" />
      <div>
        <h1 className="text-3xl font-black text-slate-900">Sales & Revenue Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time overview of bookings, capacity utilization, and financial metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tickets Sold</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalTicketsSold || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Bookings</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalBookings || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Events</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalEvents || 0}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>Sales Revenue Over Time</span>
        </h3>

        <div className="h-64 w-full">
          {stats?.salesTimeline?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesTimeline}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
              No sales data recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Capacity Utilization Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Capacity Utilization Per Category</h3>

        <div className="space-y-4">
          {stats?.categoryBreakdown?.map((cat: any, i: number) => {
            const percentage = Math.min(100, Math.round((cat.sold / cat.capacity) * 100));

            return (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{cat.eventName} — <span className="text-indigo-600">{cat.categoryName}</span></span>
                  <span className="text-slate-500">{cat.sold} / {cat.capacity} ({percentage}%)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percentage >= 90 ? 'bg-rose-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
