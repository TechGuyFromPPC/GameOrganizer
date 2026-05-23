'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CreateTeam from '../../components/CreateTeam';
import EditTeamModal from '../../components/EditTeamModal';

export default function TournamentDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [tournament, setTournament] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingTeam, setEditingTeam] = useState<any>(null);
  
  // New state for Teams
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchTournament();
    fetchTeams();
  }, [id]);

  const fetchTournament = async () => {
    const { data } = await supabase.from('tournaments').select('*').eq('id', id).single();
    if (data) {
      setTournament(data);
      setFormData(data);
    }
  };

  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select('*').eq('tournament_id', id);
    if (data) setTeams(data);
  };

  const handleUpdate = async () => {
    const { error } = await supabase.from('tournaments').update(formData).eq('id', id);
    if (!error) {
      setIsEditing(false);
      fetchTournament();
    } else {
      alert("Update failed: " + error.message);
    }
  };

  if (!tournament) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#450a0a] p-8 text-white">
      <button onClick={() => router.back()} className="text-amber-500 mb-6 underline">← Back to Dashboard</button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tournament Info Section */}
        <div className="bg-red-950/50 p-8 rounded-2xl border border-red-900">
           {/* ... (Your existing Edit/View Tournament code) ... */}
        </div>

        {/* Team Management Section */}
        {/* Team Management Section */}
        <div className="space-y-6">
          <div className="bg-red-950/50 p-8 rounded-2xl border border-red-900">
            <CreateTeam tournamentId={id} />
          </div>

          <div className="bg-red-950/50 p-8 rounded-2xl border border-red-900">
            <h3 className="text-xl font-black text-amber-500 mb-4">Registered Teams</h3>
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="flex justify-between items-center bg-red-900 p-3 rounded">
                  <span className="font-bold">{team.team_name}</span>
                  <button 
                    onClick={() => setEditingTeam(team)} // Update state to open modal
                    className="bg-amber-500 text-black px-3 py-1 rounded text-xs font-bold"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Conditional Modal Rendering */}
        {editingTeam && (
          <EditTeamModal 
            team={editingTeam} 
            onClose={() => setEditingTeam(null)} 
            onSave={() => { 
              fetchTeams(); // Refresh the list after save
              setEditingTeam(null); 
            }} 
          />
        )}
      </div>
    </div>
  );
}