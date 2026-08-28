'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import { useAuthStore } from '../../../lib/auth-store';
import BackButton from '../../../components/BackButton';
import { Calendar, MapPin, Ticket as TicketIcon, AlertTriangle, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Event } from '@eventhub/types';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => fetchApi<{ event: Event }>(`/events/${id}`),
  });

  const event = data?.data?.event;

  const handleQuantityChange = (catId: string, delta: number, maxAvailable: number) => {
    const current = quantities[catId] || 0;
    const updated = Math.max(0, Math.min(maxAvailable, current + delta));
    setQuantities({ ...quantities, [catId]: updated });
  };

  const selectedItems = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([catId, qty]) => ({ ticketCategoryId: catId, quantity: qty }));

  const subtotal = event?.categories?.reduce((sum, cat) => {
    const qty = quantities[cat.id] || 0;
    return sum + cat.price * qty;
  }, 0) || 0;

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (selectedItems.length === 0) return;

    setLoadingCheckout(true);
    setErrorMessage('');

    const response = await fetchApi<{ checkoutUrl: string; bookingId: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        eventId: event!.id,
        items: selectedItems,
      }),
    });

    setLoadingCheckout(false);

    if (response.success && response.data) {
      window.location.href = response.data.checkoutUrl;
    } else {
      setErrorMessage(response.message || 'Failed to initiate checkout.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <BackButton href="/events" label="Back to Events" />
        <div className="h-96 bg-white border border-slate-200 rounded-3xl animate-pulse shadow-sm" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <BackButton href="/events" label="Back to Events" />
        <div className="text-center py-20 text-slate-500 font-semibold">Event not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton href="/events" label="Back to Events" />
      {/* Event Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="h-72 w-full bg-slate-900 relative">
          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>

        <div className="p-8 relative -mt-24 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white text-indigo-700 shadow-md border border-slate-200">
              {event.status}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-md">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm font-semibold text-white pt-2">
            <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-sm">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{event.date} ({event.startTime} - {event.endTime})</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-sm">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About This Event</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">{event.description}</p>
          </div>

          {/* Ticket Selection List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <TicketIcon className="w-5 h-5 text-indigo-600" />
              <span>Select Ticket Categories</span>
            </h2>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              {event.categories?.map((cat) => {
                const remaining = cat.totalCapacity - cat.ticketsSold;
                const isSoldOut = remaining <= 0;
                const selectedQty = quantities[cat.id] || 0;

                return (
                  <div
                    key={cat.id}
                    className={`p-5 rounded-xl border transition-all ${
                      selectedQty > 0
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-lg">{cat.name}</h3>
                          {isSoldOut ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              SOLD OUT
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              {remaining} remaining
                            </span>
                          )}
                        </div>
                        <p className="text-indigo-600 font-extrabold text-xl mt-1">${cat.price.toFixed(2)}</p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-3">
                        <button
                          disabled={isSoldOut || selectedQty === 0}
                          onClick={() => handleQuantityChange(cat.id, -1, remaining)}
                          className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 font-bold text-lg text-slate-700 disabled:opacity-40 hover:bg-slate-200 transition-colors flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-extrabold text-slate-900 text-lg">{selectedQty}</span>
                        <button
                          disabled={isSoldOut || selectedQty >= remaining}
                          onClick={() => handleQuantityChange(cat.id, 1, remaining)}
                          className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 font-bold text-lg text-slate-700 disabled:opacity-40 hover:bg-slate-200 transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Order Summary</h3>

            {selectedItems.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6 font-medium">Select ticket quantities to proceed.</p>
            ) : (
              <div className="space-y-3 text-sm font-medium">
                {event.categories?.map((cat) => {
                  const qty = quantities[cat.id] || 0;
                  if (qty <= 0) return null;
                  return (
                    <div key={cat.id} className="flex justify-between text-slate-600">
                      <span>{cat.name} × {qty}</span>
                      <span className="font-bold text-slate-900">${(cat.price * qty).toFixed(2)}</span>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-lg font-black">
                  <span className="text-slate-900">Total</span>
                  <span className="text-indigo-600">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              disabled={selectedItems.length === 0 || loadingCheckout}
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 font-bold text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{loadingCheckout ? 'Processing...' : 'Proceed to Checkout'}</span>
            </button>

            <div className="text-xs text-slate-500 font-medium flex items-center justify-center space-x-1.5 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Encrypted Stripe Checkout & Instant E-Tickets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
