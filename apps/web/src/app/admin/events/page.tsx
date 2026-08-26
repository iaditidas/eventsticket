'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/api';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Edit3, Trash2, CheckCircle, Ban } from 'lucide-react';
import { Event } from '@eventhub/types';

export default function AdminEventsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => fetchApi<{ events: Event[] }>('/events'),
  });

  const events = data?.data?.events || [];

  const handleCancelEvent = async (id: string) => {
    if (!confirm('Are you sure you want to set this event status to CANCELLED?')) return;
    await fetchApi(`/admin/events/${id}`, { method: 'DELETE' });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Event Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Create, edit, and control publishing status for all events.</p>
        </div>

        <Link
          href="/admin/events/new"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="h-64 glass-card rounded-2xl animate-pulse" />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Event Title</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Venue</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white">{evt.title}</td>
                    <td className="p-4 text-xs text-slate-400">{evt.date}</td>
                    <td className="p-4 text-xs text-slate-400">{evt.venue}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          evt.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleCancelEvent(evt.id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Cancel Event"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
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
