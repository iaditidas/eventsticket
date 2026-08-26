'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import Link from 'next/link';
import { Search, Calendar, MapPin, Ticket, ArrowRight, Tag } from 'lucide-react';
import { Event } from '@eventhub/types';

export default function EventsBrowsePage() {
  const [search, setSearch] = useState('');
  const [venueFilter, setVenueFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['events', search, venueFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (venueFilter) queryParams.append('venue', venueFilter);
      return fetchApi<{ events: Event[] }>(`/events?${queryParams.toString()}`);
    },
  });

  const events = data?.data?.events || [];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-12 border border-slate-800 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Ticket className="w-3.5 h-3.5 mr-1.5" /> Next-Gen Event Ticketing
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Discover & Book Extraordinary Events
          </h1>
          <p className="text-slate-400 text-lg">
            Secure admission passes with instant QR code ticketing, live capacity tracking, and effortless checkout.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search events by title or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter venue..."
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl glass-card animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-800">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No events matched your search</h3>
          <p className="text-slate-500 text-sm mt-1">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const minPrice = event.categories?.length
              ? Math.min(...event.categories.map((c) => c.price))
              : 0;

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group rounded-2xl glass-card border border-slate-800 overflow-hidden glass-card-hover flex flex-col"
              >
                <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-xs font-bold text-indigo-400">
                    From ${minPrice}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2">{event.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{event.date} • {event.startTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                    <span>Select Tickets</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
