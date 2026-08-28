'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import Link from 'next/link';
import BackButton from '../../../components/BackButton';
import { CheckCircle, Download, Loader2 } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
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
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Finalizing your tickets...</h2>
        <p className="text-slate-500 text-sm">Validating Stripe payment and generating QR admission pass.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-4">
      <BackButton href="/events" label="Back to Events" />
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Booking Confirmed!</h1>
          <p className="text-slate-500 text-sm">
            Your admission tickets have been generated with unique QR codes for check-in.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-sm font-medium">
          <div className="flex justify-between text-slate-500">
            <span>Booking Reference</span>
            <span className="font-mono text-slate-900 font-bold">{bookingId}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Status</span>
            <span className="text-emerald-700 font-bold">CONFIRMED</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/my-bookings"
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>View & Download Tickets</span>
            <Download className="w-4 h-4" />
          </Link>
          <Link
            href="/events"
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition-colors flex items-center justify-center space-x-1"
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
    <Suspense fallback={<div className="text-center py-20 text-slate-500 font-semibold">Loading payment confirmation...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
