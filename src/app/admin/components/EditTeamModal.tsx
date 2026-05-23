'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EditTeamModal({ team, onClose, onSave }: any) {
  const [formData, setFormData] = useState(team);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('teams')
      .update(formData)
      .eq('id', team.id);

    if (!error) {
      onSave();
      onClose();
    } else {
      alert("Error updating team: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-red-950 p-6 rounded-2xl w-full max-w-md border border-red-800">
        <h2 className="text-xl font-black text-amber-500 mb-4">Edit Team</h2>
        <input 
          className="w-full p-2 bg-red-900 rounded mb-3" 
          value={formData.team_name} 
          onChange={(e) => setFormData({...formData, team_name: e.target.value})} 
        />
        <input 
          className="w-full p-2 bg-red-900 rounded mb-4" 
          value={formData.team_captain || ""} 
          placeholder="Captain Name"
          onChange={(e) => setFormData({...formData, team_captain: e.target.value})} 
        />
        <div className="flex gap-2">
          <button onClick={handleUpdate} className="bg-amber-500 text-black px-4 py-2 rounded font-bold">Save</button>
          <button onClick={onClose} className="bg-red-800 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}