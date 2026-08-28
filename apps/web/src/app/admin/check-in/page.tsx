'use client';

import { useState } from 'react';
import { fetchApi } from '../../../lib/api';
import BackButton from '../../../components/BackButton';
import { QrCode, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';

export default function CheckInScannerToolPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScanOrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    setResult(null);
    setError('');

    const res = await fetchApi('/tickets/check-in', {
      method: 'POST',
      body: JSON.stringify({ ticketCode: ticketCode.trim() }),
    });

    setLoading(false);

    if (res.success) {
      setResult(res.data);
      setTicketCode('');
    } else {
      setError(res.message || 'Check-in failed.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <BackButton href="/admin" label="Back to Dashboard" />
      <div>
        <h1 className="text-3xl font-black text-slate-900">Venue Check-in Scanner</h1>
        <p className="text-slate-500 text-sm mt-1">Scan or enter ticket code to validate admission pass in real-time.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <form onSubmit={handleScanOrSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Code / QR Payload</label>
            <div className="relative">
              <QrCode className="absolute left-3.5 top-3.5 w-5 h-5 text-indigo-600" />
              <input
                type="text"
                required
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="e.g. TCK-K9A0X-7F2A"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono uppercase tracking-wider focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-5 h-5" />
            <span>{loading ? 'Validating Pass...' : 'Validate Admission'}</span>
          </button>
        </form>

        {/* Scan Results Banner */}
        {result && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-700 font-black text-lg">
              <CheckCircle className="w-6 h-6 shrink-0 text-emerald-600" />
              <span>VALID TICKET — ADMIT ATTENDEE</span>
            </div>

            <div className="text-xs space-y-1.5 bg-white p-3.5 rounded-xl border border-emerald-200 font-medium shadow-xs">
              <p><span className="text-slate-500">Attendee:</span> <strong className="text-slate-900 font-bold">{result.attendee}</strong></p>
              <p><span className="text-slate-500">Event:</span> <strong className="text-slate-900 font-bold">{result.event}</strong></p>
              <p><span className="text-slate-500">Category:</span> <strong className="text-indigo-600 font-extrabold">{result.category}</strong></p>
              <p><span className="text-slate-500">Checked-in at:</span> <strong className="text-slate-700">{new Date(result.ticket.checkedInAt).toLocaleTimeString()}</strong></p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
            <div className="flex items-center space-x-2 font-black text-base text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>ENTRY REJECTED</span>
            </div>
            <p className="text-xs font-semibold text-rose-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
