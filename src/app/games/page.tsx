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

export default function RealTimeMultiSportPortal() {
  const [selectedSport, setSelectedSport] = useState<SportKey | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'bracket' | 'teams' | 'schedule'>('live');
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMatchFocus, setActiveMatchFocus] = useState<string | null>(null);
  const [isCastMode, setIsCastMode] = useState(false);
  const castContainerRef = useRef<HTMLDivElement>(null);

  const fetchLiveGameTelemetry = async () => {
    if (!selectedTournament) return;
    const { data, error } = await supabase
      .from('tournament_matches')
      .select('id, tournament_id, round_number, match_number, team_a_score, team_b_score, status, current_period, team_a_fouls, team_b_fouls, team_a_timeouts, team_b_timeouts, clock_seconds_left, clock_is_running, team_a:team_a_id(team_name), team_b:team_b_id(team_name)')
      .eq('status', 'live')
      .order('match_number', { ascending: true });

    if (error) { console.error(error); return; }
    setLiveMatches(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedTournament && activeTab === 'live') {
      fetchLiveGameTelemetry();
      const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_matches' }, fetchLiveGameTelemetry).subscribe();
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

  return (
    <div className="min-h-screen bg-[#0f0202] text-red-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
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

        {selectedSport && !selectedTournament && (
          <div className="space-y-6">
            <button onClick={() => setSelectedSport(null)} className="text-amber-500 font-mono text-sm underline">← Back to Sports</button>
            {MOCK_SPORTS_DATABASE[selectedSport].tournaments.map((t) => (
              <div key={t.id} className="bg-red-950 border border-red-900 p-6 rounded-2xl flex justify-between items-center">
                <h3 className="font-black text-2xl uppercase">{t.title}</h3>
                <button onClick={() => setSelectedTournament(t)} className="bg-amber-500 text-red-950 font-black px-6 py-2 rounded-xl">Launch Portal</button>
              </div>
            ))}
          </div>
        )}

        {selectedTournament && (
          <div className="bg-red-950/50 border border-red-900 rounded-3xl p-6 min-h-[500px]">
             {/* Portal UI would go here */}
             <button onClick={() => setSelectedTournament(null)} className="text-amber-500 mb-4">Exit Tournament</button>
             <p>Welcome to {selectedTournament.title}. Live telemetry connection active.</p>
          </div>
        )}
      </div>
    </div>
  );
}