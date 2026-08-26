'use client';

import Link from 'next/link';
import { useAuthStore } from '../lib/auth-store';
import { Ticket, Shield, LogOut, User, LayoutDashboard, QrCode } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-xl font-black tracking-tight text-white group">
          <div className="p-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span>Event<span className="text-indigo-400">Hub</span></span>
        </Link>

        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/events" className="text-slate-300 hover:text-white transition-colors">
            Browse Events
          </Link>

          {user && (
            <Link href="/my-bookings" className="text-slate-300 hover:text-white transition-colors">
              My Bookings
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <div className="flex items-center space-x-4 border-l border-slate-700 pl-4">
              <Link href="/admin" className="flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300">
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
              <Link href="/admin/check-in" className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300">
                <QrCode className="w-4 h-4" />
                <span>Check-in Tool</span>
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-3 ml-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {user.role === 'ADMIN' ? <Shield className="w-3 h-3 text-indigo-400 mr-1" /> : <User className="w-3 h-3 text-slate-400 mr-1" />}
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-semibold shadow-lg shadow-indigo-600/30 transition-all"
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
