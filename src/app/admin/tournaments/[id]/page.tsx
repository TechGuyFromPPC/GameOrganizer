'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CreateTeam from '../../components/CreateTeam';
import EditTeamModal from '../../components/EditTeamModal';
import SingleEliminationBracket from '../../../games/components/SingleEliminationBracket';
import RoundRobinGrid from '../../../games/components/RoundRobinGrid';
import MatchControl from '../../components/MatchControl';
import ScoreboardInterface from '../../components/ScoreboardInterface'; // Import the new component

export default function TournamentDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [tournament, setTournament] = useState<any>(null);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const activeMatch = matches.find(m => m.status === 'live');

  useEffect(() => {
    fetchTournament();
    fetchTeams();
    fetchMatches();
  }, [id]);

  const fetchTournament = async () => {
    const { data } = await supabase.from('tournaments').select('*').eq('id', id).single();
    if (data) setTournament({ ...data, format: data.format || 'single_elimination' });
  };

  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select('*').eq('tournament_id', id);
    if (data) setTeams(data);
  };

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('tournament_matches')
      .select(`*, team_a:team_a_id(team_name), team_b:team_b_id(team_name)`)
      .eq('tournament_id', id)
      .order('match_number', { ascending: true });
    if (data) setMatches(data);
  };

  const generateMatches = async () => {
    if (teams.length < 2) {
      alert("You need at least 2 teams to generate matches!");
      return;
    }

    await supabase.from('tournament_matches').delete().eq('tournament_id', id);

    if (tournament.format === 'single_elimination') {
      const matches = [
        { tournament_id: id, round_type: 'semifinal', match_number: 1, team_a_id: teams[0].id, team_b_id: teams[3]?.id || teams[1].id },
        { tournament_id: id, round_type: 'semifinal', match_number: 2, team_a_id: teams[1].id, team_b_id: teams[2]?.id || teams[0].id },
        { tournament_id: id, round_type: 'final', match_number: 3, team_a_id: null, team_b_id: null }
      ];
      await supabase.from('tournament_matches').insert(matches);
    } else if (tournament.format === 'round_robin') {
      const matches = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matches.push({ tournament_id: id, round_type: 'group_stage', team_a_id: teams[i].id, team_b_id: teams[j].id });
        }
      }
      await supabase.from('tournament_matches').insert(matches);
    }
    
    alert("Bracket generated successfully!");
    fetchMatches();
    fetchTeams();
  };

  const updateTournamentFormat = async (newFormat: string) => {
    const { error } = await supabase
      .from('tournaments')
      .update({ format: newFormat })
      .eq('id', id);
      
    if (!error) {
      setTournament({ ...tournament, format: newFormat });
    } else {
      alert("Could not update format: " + error.message);
    }
  };

  if (!tournament) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#450a0a] p-8 text-white">
      <button onClick={() => router.back()} className="text-amber-500 mb-6 underline">← Back to Dashboard</button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Configuration & Preview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-red-950/50 p-8 rounded-2xl border border-red-900">
            <h2 className="text-2xl font-black uppercase text-white mb-6">{tournament.title}</h2>
            
            <label className="text-xs uppercase font-black text-red-400 tracking-wider">Tournament Format</label>
            <div className="flex gap-2 mt-2">
              {['single_elimination', 'round_robin'].map((fmt) => (
                <button 
                  key={fmt}
                  onClick={() => updateTournamentFormat(fmt)}
                  className={`px-4 py-2 rounded-lg text-[10px] uppercase font-black transition-all ${
                    tournament.format === fmt ? 'bg-amber-500 text-black' : 'bg-red-900 text-red-300 hover:bg-red-800'
                  }`}
                >
                  {fmt.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button 
              onClick={generateMatches}
              className="mt-6 w-full bg-green-700 hover:bg-green-600 text-white font-black py-3 rounded-lg uppercase tracking-widest text-sm transition-all"
            >
              Generate {tournament?.format?.replace('_', ' ') || 'Select Format'} Bracket
            </button>
          </div>

          <button 
            onClick={() => window.open(`/games?tournament=${id}`, '_blank')}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-black py-3 rounded-lg uppercase tracking-widest text-sm transition-all"
          >
            View Public Scoreboard
          </button>

          {/* LIVE MATCH CONTROL */}
          <div className="bg-red-950/50 p-8 rounded-2xl border border-red-900">
            <h3 className="text-xl font-black text-amber-500 mb-6">Live Match Control</h3>
            <MatchControl matches={matches} onUpdate={fetchMatches} />
          </div>
{/* LIVE MATCH CONTROL */}
<div className="bg-red-950/50 p-8 rounded-2xl border border-red-900">
  <h3 className="text-xl font-black text-amber-500 mb-6">Live Match Control</h3>
  
  {activeMatch ? (
    // If a match is 'live', show the ScoreboardInterface
    <div className="mt-4">
      <ScoreboardInterface matchId={activeMatch.id} />
      <button 
        onClick={() => {
            // Optional: Add a button here to force a manual "END" 
            // if you don't want to use the one inside ScoreboardInterface
        }}
        className="mt-4 w-full bg-red-700 py-2 rounded font-black text-xs"
      >
        FINISH MATCH
      </button>
    </div>
  ) : (
    // If no match is 'live', show the standard list control
    <MatchControl matches={matches} onUpdate={fetchMatches} />
  )}
</div>
          {/* Bracket Preview */}
          <div className="bg-red-950/50 p-8 rounded-2xl border border-red-900">
            <h3 className="text-xl font-black text-amber-500 mb-6">Bracket Preview</h3>
            {tournament.format === 'single_elimination' ? (
              <SingleEliminationBracket tournamentId={id} />
            ) : tournament.format === 'round_robin' ? (
              <RoundRobinGrid tournamentId={id} />
            ) : (
              <p className="text-red-400">Select a format and generate to see the bracket.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Team Management */}
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
                    onClick={() => setEditingTeam(team)}
                    className="bg-amber-500 text-black px-3 py-1 rounded text-xs font-bold"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {editingTeam && (
        <EditTeamModal 
          team={editingTeam} 
          onClose={() => setEditingTeam(null)} 
          onSave={() => { fetchTeams(); setEditingTeam(null); }} 
        />
      )}
    </div>
  );
}