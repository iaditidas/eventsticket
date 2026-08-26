'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import { useAuthStore } from '../../../lib/auth-store';
import { Calendar, MapPin, Ticket as TicketIcon, CheckCircle, AlertTriangle, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Event, TicketCategory } from '@eventhub/types';

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
      // Redirect to Stripe / Instant Checkout confirmation
      window.location.href = response.data.checkoutUrl;
    } else {
      setErrorMessage(response.message || 'Failed to initiate checkout.');
    }
  };

  if (isLoading) {
    return <div className="h-96 glass-card rounded-3xl animate-pulse" />;
  }

  if (!event) {
    return <div className="text-center py-20 text-slate-400">Event not found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Event Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-slate-800">
        <div className="h-72 w-full bg-slate-900 relative">
          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="p-8 relative -mt-24 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {event.status}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white">{event.title}</h1>

          <div className="flex flex-wrap gap-6 text-sm text-slate-300 pt-2">
            <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{event.date} ({event.startTime} - {event.endTime})</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">About This Event</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Ticket Selection List */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <TicketIcon className="w-5 h-5 text-indigo-400" />
              <span>Select Ticket Categories</span>
            </h2>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-2">
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
                        ? 'bg-indigo-950/30 border-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-white text-lg">{cat.name}</h3>
                          {isSoldOut ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              SOLD OUT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {remaining} remaining
                            </span>
                          )}
                        </div>
                        <p className="text-indigo-400 font-extrabold text-xl mt-1">${cat.price.toFixed(2)}</p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-3">
                        <button
                          disabled={isSoldOut || selectedQty === 0}
                          onClick={() => handleQuantityChange(cat.id, -1, remaining)}
                          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 font-bold text-lg text-slate-200 disabled:opacity-30 hover:bg-slate-700 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-white text-lg">{selectedQty}</span>
                        <button
                          disabled={isSoldOut || selectedQty >= remaining}
                          onClick={() => handleQuantityChange(cat.id, 1, remaining)}
                          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 font-bold text-lg text-slate-200 disabled:opacity-30 hover:bg-slate-700 transition-colors"
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
          <div className="glass-card p-6 rounded-2xl border border-slate-800 sticky top-24 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Order Summary</h3>

            {selectedItems.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">Select ticket quantities to proceed.</p>
            ) : (
              <div className="space-y-3 text-sm">
                {event.categories?.map((cat) => {
                  const qty = quantities[cat.id] || 0;
                  if (qty <= 0) return null;
                  return (
                    <div key={cat.id} className="flex justify-between text-slate-300">
                      <span>{cat.name} × {qty}</span>
                      <span className="font-semibold text-white">${(cat.price * qty).toFixed(2)}</span>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-lg font-black">
                  <span className="text-slate-200">Total</span>
                  <span className="text-indigo-400">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              disabled={selectedItems.length === 0 || loadingCheckout}
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-bold text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{loadingCheckout ? 'Processing...' : 'Proceed to Checkout'}</span>
            </button>

            <div className="text-xs text-slate-500 flex items-center justify-center space-x-1.5 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Encrypted Stripe Checkout & Guaranteed Ticket Capacity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
