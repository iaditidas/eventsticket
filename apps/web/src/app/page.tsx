'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import Link from 'next/link';
import { Search, Calendar, MapPin, Ticket, ArrowRight, Clock, Info } from 'lucide-react';
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
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 border border-slate-200 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs">
            <Ticket className="w-3.5 h-3.5 mr-1.5" /> Live Events Directory ({events.length} Available)
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Browse All Upcoming Events
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            Explore technology summits, music festivals, culinary expos, and live concerts. Check dates, timings, venues, and book your ₹500 admission passes instantly.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-md">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium transition-all"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by city/venue..."
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
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-white border border-slate-200 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <Ticket className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No events found matching your criteria</h3>
          <p className="text-slate-500 text-sm">Try clearing your search keyword or venue filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const minPrice = event.categories?.length
              ? Math.min(...event.categories.map((c) => c.price))
              : 500;

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group rounded-3xl bg-white border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col shadow-xs"
              >
                {/* Event Image & Price Badge */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-black text-indigo-700 shadow-md">
                    Ticket: ₹{minPrice}
                  </div>
                  <div className="absolute bottom-3 left-3.5 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-slate-700/60 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                </div>

                {/* Event Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed flex items-start space-x-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{event.description}</span>
                    </p>
                  </div>

                  {/* Venue & Timing Details */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Date: <strong className="text-slate-900">{event.date}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">Venue: <strong className="text-slate-900">{event.venue}</strong></span>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                    <span>View Event Details</span>
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
