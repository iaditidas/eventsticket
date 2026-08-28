'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../../../lib/api';
import BackButton from '../../../../components/BackButton';
import { Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('2026-11-10');
  const [bannerImage, setBannerImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([
    { name: 'General Admission', price: 49, totalCapacity: 100 },
    { name: 'VIP Pass', price: 149, totalCapacity: 25 },
  ]);

  const addCategory = () => {
    setCategories([...categories, { name: 'Tier Category', price: 79, totalCapacity: 50 }]);
  };

  const removeCategory = (index: number) => {
    if (categories.length === 1) return;
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, field: string, value: any) => {
    const updated = [...categories];
    (updated[index] as any)[field] = value;
    setCategories(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetchApi('/admin/events', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        venue,
        date,
        bannerImage: bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        categories,
      }),
    });

    setLoading(false);

    if (res.success) {
      router.push('/admin/events');
    } else {
      setError(res.message || 'Failed to create event');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton href="/admin/events" label="Back to Event Manager" />
      <div>
        <h1 className="text-3xl font-black text-slate-900">Create New Event</h1>
        <p className="text-slate-500 text-sm mt-1">Configure event details and ticket pricing tiers.</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI & Cloud Developer Conference 2026"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe event highlights, speakers, and schedule..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Venue Location</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Tech Auditorium, NYC"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Banner Image URL (Optional)</label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-medium"
            />
          </div>
        </div>

        {/* Ticket Categories Config */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">Ticket Categories</h3>
            <button
              type="button"
              onClick={addCategory}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold text-indigo-700 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tier</span>
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((cat, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => updateCategory(i, 'name', e.target.value)}
                  placeholder="Category Name"
                  className="col-span-5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-medium"
                />
                <input
                  type="number"
                  value={cat.price}
                  onChange={(e) => updateCategory(i, 'price', Number(e.target.value))}
                  placeholder="Price $"
                  className="col-span-3 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-medium"
                />
                <input
                  type="number"
                  value={cat.totalCapacity}
                  onChange={(e) => updateCategory(i, 'totalCapacity', Number(e.target.value))}
                  placeholder="Capacity"
                  className="col-span-3 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={() => removeCategory(i)}
                  className="col-span-1 p-2 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>{loading ? 'Publishing Event...' : 'Publish Event'}</span>
        </button>
      </form>
    </div>
  );
}
