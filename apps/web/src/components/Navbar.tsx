'use client';

import Link from 'next/link';
import { useAuthStore } from '../lib/auth-store';
import { Ticket, Shield, LogOut, User, LayoutDashboard, QrCode } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  const handleBrowseClick = (e: React.MouseEvent) => {
    const section = document.getElementById('events-grid-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 text-xl font-black tracking-tight text-slate-900 group">
          <div className="p-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span>Event<span className="text-indigo-600">Hub</span></span>
        </Link>

        <nav className="flex items-center space-x-6 text-sm font-semibold">
          <Link href="/events" onClick={handleBrowseClick} className="text-slate-600 hover:text-indigo-600 transition-colors">
            Browse Events
          </Link>

          {user && (
            <Link href="/my-bookings" className="text-slate-600 hover:text-indigo-600 transition-colors">
              My Bookings
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <div className="flex items-center space-x-4 border-l border-slate-200 pl-4">
              <Link href="/admin" className="flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-700">
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
              <Link href="/admin/check-in" className="flex items-center space-x-1.5 text-emerald-600 hover:text-emerald-700">
                <QrCode className="w-4 h-4" />
                <span>Check-in Tool</span>
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-3 ml-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {user.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5 text-indigo-600 mr-1.5" /> : <User className="w-3.5 h-3.5 text-slate-500 mr-1.5" />}
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-600/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
