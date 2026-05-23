  'use client';

  import { useState, useEffect, useRef } from 'react';
  import Link from 'next/link';
  import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const MOCK_SPORTS_DATABASE = {
    basketball: {
      label: "Basketball",
      icon: "🏀",
      tournaments: [
        {
          id: "mayors-cup-2026",
          title: "Puerto Princesa Mayor's Cup 2026",
          meta: "City Coliseum & Mendoza Park • Inter-Barangay Championship",
          status: "Active",
          teams: [
            { id: "t1", name: "Barangay San Pedro Spikers", players: ["Juan Dela Cruz", "Mark Santos", "Arnel Pineda", "Chris Almeda"] },
            { id: "t2", name: "Barangay Bancao-Bancao Aces", players: ["Kevin Castro", "Riel Mendoza", "Paolo Guinto", "Lester Gelo"] },
          ],
        }
      ]
    },
    volleyball: { label: "Volleyball", icon: "🏐", tournaments: [] },
    pickleball: { label: "Pickleball", icon: "🏓", tournaments: [] }
  };

  type SportKey = keyof typeof MOCK_SPORTS_DATABASE;

  function ScoreboardClock({ initialSeconds, isRunning, isCastMode }: { initialSeconds: number; isRunning: boolean; isCastMode: boolean; }) {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const lastAuthoritativeTime = useRef(initialSeconds);

    useEffect(() => {
      if (Math.abs(secondsLeft - initialSeconds) > 2 || initialSeconds !== lastAuthoritativeTime.current) {
        setSecondsLeft(initialSeconds);
        lastAuthoritativeTime.current = initialSeconds;
      }
    }, [initialSeconds]);

    useEffect(() => {
      if (!isRunning || secondsLeft <= 0) return;
      const timer = setInterval(() => setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
      return () => clearInterval(timer);
    }, [isRunning, secondsLeft]);

    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;

    
    
    return (
      <div className={`font-mono font-black text-amber-400 bg-red-950 border-2 border-red-900 rounded-2xl shadow-inner tracking-tight transition-all duration-200 ${
        isCastMode ? 'text-8xl px-12 py-8 shadow-amber-900/20' : 'text-3xl px-4 py-2'
      }`}>
        {`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`}
      </div>
    );
  }

  type TabType = 'live' | 'bracket' | 'teams' | 'schedule' | 'history' | 'standings';
  export default function RealTimeMultiSportPortal() {
    const [selectedSport, setSelectedSport] = useState<SportKey | null>(null);
    const [selectedTournament, setSelectedTournament] = useState<any | null>(null);
const [activeTab, setActiveTab] = useState<TabType>('live');    const [liveMatches, setLiveMatches] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [activeMatchFocus, setActiveMatchFocus] = useState<string | null>(null);
    const [isCastMode, setIsCastMode] = useState(false);
    const castContainerRef = useRef<HTMLDivElement>(null);
    const [tournaments, setTournaments] = useState<any[]>([]); // Initialize as empty array
    const [sports, setSports] = useState<{ label: string, key: string, icon: string }[]>([
  { label: 'Basketball', key: 'basketball', icon: '🏀' },
  { label: 'Volleyball', key: 'volleyball', icon: '🏐' },
  { label: 'Pickleball', key: 'pickleball', icon: '🏓' }
]);
    const [teams, setTeams] = useState<any[]>([]);
    useEffect(() => {
  const fetchTeams = async () => {
    if (!selectedTournament) return;
    
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('tournament_id', selectedTournament.id);
      
    if (error) console.error("Error fetching teams:", error);
    else setTeams(data || []);
  };

  fetchTeams();
}, [selectedTournament]);


{!selectedSport && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {sports.map((s) => (
      <button key={s.key} onClick={() => setSelectedSport(s.key as SportKey)} className="...">
        <div className="text-5xl">{s.icon}</div>
        <h3 className="font-black uppercase">{s.label}</h3>
      </button>
    ))}
  </div>
)}
// Replace your old team useEffect with this:
const fetchTeams = async () => {
  if (!selectedTournament) return;
  
  // LOGGING IS CRITICAL HERE:
  console.log("Looking for teams where tournament_id is:", selectedTournament.id);
  
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', selectedTournament.id); // This MUST be the string 'MayorsCup1'
    
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Data returned from Supabase:", data);
    setTeams(data || []);
  }
};

// Render this in your JSX:
<div className="mt-8">
  <h3 className="text-xl font-black text-amber-500 mb-4">Participating Teams</h3>
  <div className="grid gap-4">
    {teams.map(t => (
      <div key={t.team_name} className="p-4 bg-red-950 border border-red-900 rounded-lg">
        <p className="font-bold">{t.team_name}</p>
        <p className="text-sm text-red-300">Captain: {t.team_captain}</p>
      </div>
    ))}
  </div>
</div>
    useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase.from('tournaments').select('*');
      if (error) console.error("Error fetching tournaments:", error);
      else setTournaments(data || []);
    };
    fetchTournaments();
  }, []);

    const fetchLiveGameTelemetry = async () => {
    if (!selectedTournament) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('tournament_matches')
      .select(`
        id, 
        tournament_id, 
        round_number, 
        match_number, 
        team_a_score, 
        team_b_score, 
        status, 
        current_period, 
        team_a_fouls, 
        team_b_fouls, 
        team_a_timeouts, 
        team_b_timeouts, 
        clock_seconds_left, 
        clock_is_running, 
        team_a:team_a_id(team_name), 
        team_b:team_b_id(team_name)
      `)
      .eq('tournament_id', selectedTournament.id) // <--- THIS IS THE MISSING PIECE
      .eq('status', 'live')
      .order('match_number', { ascending: true });

  if (error) {
    console.error("Supabase Error Details:", JSON.stringify(error, null, 2));
    setLoading(false);
    return;
  }
    
    setLiveMatches(data || []);
    setLoading(false);
  };
    useEffect(() => {
      if (selectedTournament && activeTab === 'live') {
        fetchLiveGameTelemetry();
      const channel = supabase
    .channel('realtime')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'tournament_matches',
      filter: `tournament_id=eq.${selectedTournament.id}` // Add this filter for better performance
    }, fetchLiveGameTelemetry)
    .subscribe();
        return () => { supabase.removeChannel(channel); };
      }
    }, [selectedTournament, activeTab]);

    const toggleFullScreenCast = async () => {
      if (!isCastMode) {
        if (castContainerRef.current?.requestFullscreen) await castContainerRef.current.requestFullscreen();
        setIsCastMode(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        setIsCastMode(false);
      }
    };

    // ... (Your code above the return remains the same)

  return (
    <div className="min-h-screen bg-[#0f0202] text-red-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- Sport Selection --- */}
        {!selectedSport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(MOCK_SPORTS_DATABASE) as SportKey[]).map((key) => (
              <button key={key} onClick={() => setSelectedSport(key)} className="group bg-red-950 border border-red-900 rounded-2xl p-8 hover:border-amber-500/50 transition-all text-left">
                <div className="text-5xl mb-4">{MOCK_SPORTS_DATABASE[key].icon}</div>
                <h3 className="font-black uppercase text-white group-hover:text-amber-400">{MOCK_SPORTS_DATABASE[key].label}</h3>
              </button>
            ))}
          </div>
        )}

        {/* --- Tournament List --- */}
        {selectedSport && !selectedTournament && (
          <div className="space-y-6">
            <button onClick={() => setSelectedSport(null)} className="text-amber-500 font-mono text-sm underline">← Back to Sports</button>
            {tournaments.filter((t: any) => t.sport === selectedSport).map((t: any) => (
              <div key={t.id} className="bg-red-950 border border-red-900 p-6 rounded-2xl flex justify-between items-center">
                <h3 className="font-black text-2xl uppercase text-white">{t.title}</h3>
                <button onClick={() => setSelectedTournament(t)} className="bg-amber-500 text-red-950 font-black px-6 py-2 rounded-xl">Launch Portal</button>
              </div>
            ))}
          </div>
        )}

        {/* --- Tournament Details & Tabs --- */}
        {selectedTournament && (
          <div className="space-y-8">
            <div className="bg-red-950/50 border border-red-900 rounded-3xl p-8 text-white space-y-4">
              <button onClick={() => setSelectedTournament(null)} className="text-amber-500 underline text-sm">← Back to List</button>
              <h2 className="text-4xl font-black uppercase">{selectedTournament.title}</h2>
              <div className="flex gap-2 mt-6 border-b border-red-900 overflow-x-auto">
  {['live', 'bracket', 'teams', 'standings', 'history'].map((tab) => (
    <button 
      key={tab}
      onClick={() => setActiveTab(tab as any)}
      className={`uppercase font-black text-xs px-6 py-3 transition-colors ${
        activeTab === tab ? 'text-amber-400 border-b-2 border-amber-500' : 'text-red-400 hover:text-white'
      }`}
    >
      {tab}
    </button>
  ))}
</div>
            </div>

            {/* --- Tab Content --- */}
          {/* Tab Content Area */}
<div className="min-h-[300px] mt-6">
  
  {activeTab === 'live' && (
    <div className="text-center py-20 border-2 border-dashed border-red-900 rounded-3xl">
      <h3 className="text-2xl font-black text-white">Live Games</h3>
      {liveMatches.length > 0 ? (
        <p className="text-amber-400">Showing {liveMatches.length} active match(es)...</p>
      ) : (
        <p className="text-red-400 mt-2">We will update the live status once the tournament starts.</p>
      )}
    </div>
  )}

  {activeTab === 'bracket' && (
    <div className="text-center py-20 border-2 border-dashed border-red-900 rounded-3xl">
      <h3 className="text-2xl font-black text-white">Tournament Bracket</h3>
      {/* Add logic to check if bracket data exists */}
      <p className="text-red-400 mt-2">We will update the bracket once the tournament starts.</p>
    </div>
  )}

  {activeTab === 'teams' && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {teams.length > 0 ? (
        teams.map((t) => (
          <div key={t.id} className="p-4 bg-red-950 border border-red-900 rounded-lg">
            <p className="font-bold text-white">{t.team_name}</p>
            <p className="text-sm text-red-300">Captain: {t.team_captain}</p>
          </div>
        ))
      ) : (
        <p className="text-red-400 italic">No teams registered yet.</p>
      )}
    </div>
  )}

  {activeTab === 'standings' && (
  <div className="text-center py-20 border-2 border-dashed border-red-900 rounded-3xl">
    <h3 className="text-2xl font-black text-white">League Standings</h3>
    <p className="text-red-400 mt-2">We will update the standings once the tournament starts.</p>
  </div>
)}

  {activeTab === 'history' && (
    <div className="text-center py-20 border-2 border-dashed border-red-900 rounded-3xl">
      <h3 className="text-2xl font-black text-white">Game History</h3>
      <p className="text-red-400 mt-2">We will update it once the tournament starts.</p>
    </div>
  )}
</div>

          </div>
        )}

      </div> {/* Closes max-w-6xl */}
    </div> // Closes min-h-screen
  );
}