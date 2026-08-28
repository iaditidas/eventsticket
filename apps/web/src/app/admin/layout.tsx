'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import { LayoutDashboard, Calendar, Users, ShoppingBag, QrCode, ShieldAlert } from 'lucide-react';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-20 text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 text-sm">Organizer / Admin privileges required to view this area.</p>
        <Link href="/login" className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all">
          Sign in as Admin
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Event Manager', href: '/admin/events', icon: Calendar },
    { label: 'Master Bookings', href: '/admin/bookings', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Check-in Tool', href: '/admin/check-in', icon: QrCode },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
      <aside className="md:col-span-1 space-y-3">
        <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Organizer Hub
        </div>
        <div className="space-y-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="md:col-span-4">{children}</div>
    </div>
  );
}
