'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = 'Back', className = '' }: BackButtonProps) {
  const router = useRouter();

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-slate-50 text-xs font-bold shadow-xs transition-all ${className}`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-slate-50 text-xs font-bold shadow-xs transition-all ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
