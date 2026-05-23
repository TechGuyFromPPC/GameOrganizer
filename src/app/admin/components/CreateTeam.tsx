'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CreateTeam({ tournamentId }: { tournamentId: string }) {
  const [team, setTeam] = useState({ name: '', manager: '', contact: '', captain: '' });
  const [members, setMembers] = useState(['']);

  const addMemberField = () => setMembers([...members, '']);
  const updateMember = (idx: number, val: string) => {
    const newMembers = [...members];
    newMembers[idx] = val;
    setMembers(newMembers);
  };

  const handleSubmit = async () => {
  // Generate a random ID since the table requires one
  const newId = crypto.randomUUID(); 

  const { error } = await supabase.from('teams').insert([{
    id: newId, // Add this
    tournament_id: tournamentId,
    team_name: team.name,
    team_manager: team.manager,
    contact_number: team.contact,
    team_captain: team.captain,
    // Note: If you don't have a 'members' column in your new table, remove that line
  }]);
  
  if (error) {
    console.error("Insert Error:", error);
    alert("Error: " + error.message);
  } else {
    alert("Team Created Successfully!");
  }
};

  return (
    <div className="space-y-4 bg-red-900/30 p-6 rounded-xl border border-red-800">
      <h3 className="text-lg font-bold text-amber-500">Add New Team</h3>
      <input className="w-full p-2 bg-red-950 rounded" placeholder="Team Name" onChange={(e) => setTeam({...team, name: e.target.value})} />
      <input className="w-full p-2 bg-red-950 rounded" placeholder="Manager" onChange={(e) => setTeam({...team, manager: e.target.value})} />
      <input className="w-full p-2 bg-red-950 rounded" placeholder="Contact" onChange={(e) => setTeam({...team, contact: e.target.value})} />
      <input className="w-full p-2 bg-red-950 rounded" placeholder="Captain" onChange={(e) => setTeam({...team, captain: e.target.value})} />
      
      <div className="space-y-2">
        <label className="text-xs text-red-300">Members</label>
        {members.map((m, i) => (
          <input key={i} className="w-full p-2 bg-red-950 rounded" value={m} onChange={(e) => updateMember(i, e.target.value)} />
        ))}
        <button onClick={addMemberField} className="text-xs text-amber-500 underline">+ Add Member</button>
      </div>
      
      <button onClick={handleSubmit} className="w-full bg-amber-500 py-2 rounded font-bold text-red-950">Save Team</button>
    </div>
  );
}