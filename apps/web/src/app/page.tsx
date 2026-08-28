'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import Link from 'next/link';
import { Search, Calendar, MapPin, Ticket, ArrowRight } from 'lucide-react';
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
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 border border-slate-200 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 shadow-sm">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs">
            <Ticket className="w-3.5 h-3.5 mr-1.5" /> Next-Gen Event Ticketing
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Discover & Book Extraordinary Events
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Secure admission passes with instant QR code ticketing, live capacity tracking, and effortless checkout.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-md">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events by title or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium transition-all"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter venue..."
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium transition-all"
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Ticket className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No events matched your search</h3>
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
                className="group rounded-2xl bg-white border border-slate-200 overflow-hidden glass-card-hover flex flex-col shadow-sm"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-indigo-700 shadow-sm">
                    From ${minPrice}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{event.description}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{event.date} • {event.startTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
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
