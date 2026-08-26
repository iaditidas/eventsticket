'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import Link from 'next/link';
import { CheckCircle, Download, ArrowRight, Loader2 } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');

  const [loading, setLoading] = useState(true);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError('Missing booking ID');
      setLoading(false);
      return;
    }

    const confirm = async () => {
      const res = await fetchApi(`/bookings/confirm?bookingId=${bookingId}`);
      setLoading(false);
      if (res.success) {
        setConfirmedBooking(res.data?.booking);
      } else {
        setError(res.message || 'Payment confirmation failed');
      }
    };

    confirm();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="text-center py-24 space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white">Finalizing your tickets...</h2>
        <p className="text-slate-400 text-sm">Validating Stripe payment and generating QR admission pass.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="glass-card p-8 rounded-3xl border border-slate-800 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white">Booking Confirmed!</h1>
          <p className="text-slate-400 text-sm">
            Your admission tickets have been generated with unique QR codes for check-in.
          </p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Booking Reference</span>
            <span className="font-mono text-white font-bold">{bookingId}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Status</span>
            <span className="text-emerald-400 font-bold">CONFIRMED</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/my-bookings"
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>View & Download Tickets</span>
            <Download className="w-4 h-4" />
          </Link>
          <Link
            href="/events"
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300 transition-colors flex items-center justify-center space-x-1"
          >
            <span>Browse More Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading payment confirmation...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

