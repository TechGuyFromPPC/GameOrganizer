'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreateTournament() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    id: '', 
    title: '', 
    sport: 'basketball',
    start_date: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('tournaments')
      .insert([formData]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Tournament published successfully!");
      router.push('/admin/matches');
    }
    setLoading(false);
  };

  const inputClass = "w-full p-3 bg-red-900/50 border border-red-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-red-400";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-red-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-[#450a0a] border border-red-900 shadow-2xl rounded-2xl max-w-lg mx-auto mt-10">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Create Event</h2>
        <p className="text-red-400 text-sm">Initialize a new tournament bracket in the system.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClass}>Tournament Title</label>
          <input 
            required
            placeholder="e.g. Puerto Princesa Mayor's Cup 2026" 
            className={inputClass}
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tournament ID (Slug)</label>
            <input 
              required
              placeholder="mayors-cup-2026" 
              className={inputClass}
              onChange={(e) => setFormData({...formData, id: e.target.value})} 
            />
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input 
              type="date"
              className={inputClass}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})} 
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Category (Sport)</label>
          <select 
            value={formData.sport} 
            onChange={(e) => setFormData({...formData, sport: e.target.value})}
            className={inputClass}
          >
            <option value="basketball">Basketball</option>
            <option value="volleyball">Volleyball</option>
            <option value="pickleball">Pickleball</option>
          </select>
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full mt-8 bg-amber-500 hover:bg-amber-400 text-red-950 font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
      >
        {loading ? "Publishing..." : "Publish Tournament"}
      </button>
    </form>
  );
}