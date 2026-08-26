'use client';

import { useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { QrCode, CheckCircle, AlertTriangle, UserCheck, ShieldCheck } from 'lucide-react';

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
      <div>
        <h1 className="text-3xl font-black text-white">Venue Check-in Scanner</h1>
        <p className="text-slate-400 text-sm mt-1">Scan or enter ticket code to validate admission pass in real-time.</p>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <form onSubmit={handleScanOrSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Ticket Code / QR Payload</label>
            <div className="relative">
              <QrCode className="absolute left-3.5 top-3.5 w-5 h-5 text-indigo-400" />
              <input
                type="text"
                required
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="TCK-K9A0X-7F2A"
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-5 h-5" />
            <span>{loading ? 'Validating Pass...' : 'Validate Admission'}</span>
          </button>
        </form>

        {/* Scan Results Banner */}
        {result && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-lg">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <span>VALID TICKET — ADMIT ATTENDEE</span>
            </div>

            <div className="text-xs space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <p><span className="text-slate-400">Attendee:</span> <strong className="text-white">{result.attendee}</strong></p>
              <p><span className="text-slate-400">Event:</span> <strong className="text-white">{result.event}</strong></p>
              <p><span className="text-slate-400">Category:</span> <strong className="text-indigo-400">{result.category}</strong></p>
              <p><span className="text-slate-400">Checked-in at:</span> <strong className="text-slate-300">{new Date(result.ticket.checkedInAt).toLocaleTimeString()}</strong></p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>ENTRY REJECTED</span>
            </div>
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
