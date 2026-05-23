'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function RegisterTeam() {
  const { id } = useParams();
  const [formData, setFormData] = useState({ team_name: '', coach_name: '', contact_number: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('team_registrations').insert([{
      ...formData,
      tournament_id: id,
      status: 'pending'
    }]);
    
    if (error) alert("Error submitting registration");
    else alert("Registration submitted! Pending admin approval.");
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-red-950 text-white rounded-xl">
      <h2 className="text-2xl font-black mb-4">Register Your Team</h2>
      <input placeholder="Team Name" className="w-full p-2 mb-2 bg-red-900 rounded" onChange={(e) => setFormData({...formData, team_name: e.target.value})} />
      <input placeholder="Coach Name" className="w-full p-2 mb-2 bg-red-900 rounded" onChange={(e) => setFormData({...formData, coach_name: e.target.value})} />
      <input placeholder="Contact Number" className="w-full p-2 mb-4 bg-red-900 rounded" onChange={(e) => setFormData({...formData, contact_number: e.target.value})} />
      <button className="w-full bg-amber-500 py-2 rounded font-bold">Submit Registration</button>
    </form>
  );
}