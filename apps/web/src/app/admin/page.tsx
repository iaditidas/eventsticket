'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';
import { DollarSign, Calendar, Ticket, ShoppingBag, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => fetchApi<any>('/admin/analytics'),
  });

  const stats = data?.data;

  if (isLoading) {
    return <div className="h-96 glass-card rounded-3xl animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Sales & Revenue Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time overview of bookings, capacity utilization, and financial metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Tickets Sold</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalTicketsSold || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Confirmed Bookings</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalBookings || 0}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Events</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalEvents || 0}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <span>Sales Revenue Over Time</span>
        </h3>

        <div className="h-64 w-full">
          {stats?.salesTimeline?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesTimeline}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No sales data recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Capacity Utilization Breakdown */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">Capacity Utilization Per Category</h3>

        <div className="space-y-4">
          {stats?.categoryBreakdown?.map((cat: any, i: number) => {
            const percentage = Math.min(100, Math.round((cat.sold / cat.capacity) * 100));

            return (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{cat.eventName} — <span className="text-indigo-400">{cat.categoryName}</span></span>
                  <span className="text-slate-400">{cat.sold} / {cat.capacity} ({percentage}%)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percentage >= 90 ? 'bg-rose-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-indigo-500'
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
