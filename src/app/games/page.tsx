'use client';

import { useState } from 'react';
import Link from 'next/link';

// Expanded Database Mock Structure categorized by Sport Type
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
          { id: "t3", name: "Barangay Santa Monica Smush", players: ["Dondon Hontiveros", "Eric Salamat", "Mac Cardona", "Jojo Tangkay"] },
          { id: "t4", name: "Barangay Sicsican Paddlers", players: ["Ryan Buenafe", "Nico Salva", "Kirk Long", "Justin Chua"] },
        ],
        schedule: [
          { id: "g1", round: "Semifinals", match: "Match 1", teamA: "San Pedro", teamB: "Bancao-Bancao", scoreA: 11, scoreB: 9, status: "completed", time: "08:00 AM", venue: "City Coliseum - Court 1" },
          { id: "g2", round: "Semifinals", match: "Match 2", teamA: "Santa Monica", teamB: "Sicsican", scoreA: 11, scoreB: 12, status: "completed", time: "09:30 AM", venue: "City Coliseum - Court 2" },
          { id: "g3", round: "Championship Finals", match: "Match 3", teamA: "Barangay San Pedro Spikers", teamB: "Barangay Sicsican Paddlers", scoreA: 14, scoreB: 15, status: "live", time: "11:00 AM", venue: "City Coliseum - Center Arena Court" },
          { id: "g4", round: "3rd Place Match", match: "Match 4", teamA: "Barangay Bancao-Bancao Aces", teamB: "Barangay Santa Monica Smush", scoreA: 0, scoreB: 0, status: "scheduled", time: "01:30 PM", venue: "Mendoza Park Outdoor Court" },
        ]
      },
      {
        id: "inter-collo-2026",
        title: "Palawan Collegiate League",
        meta: "PSU Gym • Varsity Pre-Season Tourney",
        status: "Scheduled",
        teams: [],
        schedule: []
      }
    ]
  },
  volleyball: {
    label: "Volleyball",
    icon: "🏐",
    tournaments: [
      {
        id: "baragatan-volley-2026",
        title: "Baragatan Festival Volleyball Open",
        meta: "Lamberto Palanos Gym • Regional Invitationals",
        status: "Active",
        teams: [
          { id: "vt1", name: "Palawan Bearcats", players: ["R. Estoya", "J. Gabuco", "M. Tabang"] },
          { id: "vt2", name: "Puerto Princesa City Spikers", players: ["A. Edradan", "C. Valera", "K. Lagrada"] }
        ],
        schedule: [
          { id: "vg1", round: "Eliminations", match: "Match 1", teamA: "Palawan Bearcats", teamB: "PPC Spikers", scoreA: 25, scoreB: 22, status: "live", time: "02:00 PM", venue: "Lamberto Palanos Gym" }
        ]
      }
    ]
  },
  pickleball: {
    label: "Pickleball",
    icon: "🏓",
    tournaments: [
      {
        id: "pp-pickleball-open",
        title: "Puerto Princesa Pickleball Open 2026",
        meta: "City Sports Complex Indoor Courts",
        status: "Completed",
        teams: [],
        schedule: []
      }
    ]
  }
};

type SportKey = keyof typeof MOCK_SPORTS_DATABASE;

export default function MultiSportPortal() {
  // Navigation States
  const [selectedSport, setSelectedSport] = useState<SportKey | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'bracket' | 'teams' | 'schedule'>('live');
  
  // Scoring Simulation state
  const [demoMatch, setDemoMatch] = useState({ scoreA: 14, scoreB: 15 });

  const handleSelectTournament = (tournament: any) => {
    setSelectedTournament(tournament);
    // Grab the live match baseline scores if they exist
    const live = tournament.schedule?.find((g: any) => g.status === 'live');
    if (live) {
      setDemoMatch({ scoreA: live.scoreA, scoreB: live.scoreB });
    }
    setActiveTab('live');
  };

  const simulateScore = (team: 'A' | 'B') => {
    setDemoMatch(prev => ({
      scoreA: team === 'A' ? prev.scoreA + 1 : prev.scoreA,
      scoreB: team === 'B' ? prev.scoreB + 1 : prev.scoreB,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* DYNAMIC BREADCRUMB TRAILS */}
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <Link href="/" className="hover:underline text-slate-400">Hub Home</Link>
          <span>/</span>
          <button onClick={() => { setSelectedSport(null); setSelectedTournament(null); }} className={`${!selectedSport ? 'text-slate-200 font-bold' : 'hover:underline text-slate-400'}`}>
            Sports Matrix
          </button>
          {selectedSport && (
            <>
              <span>/</span>
              <button onClick={() => setSelectedTournament(null)} className={`${!selectedTournament ? 'text-slate-200 font-bold' : 'hover:underline text-slate-400'}`}>
                {MOCK_SPORTS_DATABASE[selectedSport].label}
              </button>
            </>
          )}
          {selectedTournament && (
            <>
              <span>/</span>
              <span className="text-slate-200 font-bold truncate max-w-[200px]">{selectedTournament.title}</span>
            </>
          )}
        </div>

        {/* ---------------- LEVEL 1: SPORT CATEGORY SELECTION SEED ---------------- */}
        {!selectedSport && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black uppercase text-white tracking-tight">Select Sports Category</h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Choose an athletic discipline to view regional tournaments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.keys(MOCK_SPORTS_DATABASE) as SportKey[]).map((key) => {
                const sport = MOCK_SPORTS_DATABASE[key];
                return (
                  <button 
                    key={key}
                    onClick={() => setSelectedSport(key)}
                    className="group bg-slate-950 border border-slate-800 rounded-2xl p-6 text-left hover:border-emerald-500/40 hover:bg-slate-950/80 transition-all duration-300 shadow-xl flex items-center space-x-4"
                  >
                    <div className="text-4xl bg-slate-900 h-16 w-16 rounded-xl flex items-center justify-center border border-slate-800 group-hover:scale-105 transition-transform">
                      {sport.icon}
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">{sport.label}</h3>
                      <p className="text-[11px] font-mono text-slate-500">{sport.tournaments.length} Active Events Listed</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- LEVEL 2: TOURNAMENT LIST SEED ---------------- */}
        {selectedSport && !selectedTournament && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black uppercase text-white tracking-tight">
                  {MOCK_SPORTS_DATABASE[selectedSport].icon} {MOCK_SPORTS_DATABASE[selectedSport].label} Tournaments
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Active configurations tracking in real time.</p>
              </div>
              <button onClick={() => setSelectedSport(null)} className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition">
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {MOCK_SPORTS_DATABASE[selectedSport].tournaments.map((tournament) => (
                <div 
                  key={tournament.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider ${
                        tournament.status === 'Active' ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' :
                        tournament.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}>
                        {tournament.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-white tracking-tight mt-1.5">{tournament.title}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{tournament.meta}</p>
                  </div>

                  <button 
                    onClick={() => handleSelectTournament(tournament)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black rounded-xl transition uppercase shadow-md self-start md:self-auto"
                  >
                    Launch Scoreboard Suite →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- LEVEL 3: THE LIVE INSTRUMENTATION UI PANEL ---------------- */}
        {selectedSport && selectedTournament && (
          <div className="space-y-6">
            
            {/* TOURNAMENT SUB-HEADER STRIP */}
            <header className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 font-bold mb-1">
                  <span>{MOCK_SPORTS_DATABASE[selectedSport].icon} {MOCK_SPORTS_DATABASE[selectedSport].label.toUpperCase()} DETAILED ENGINE</span>
                </div>
                <h1 className="text-xl font-black uppercase text-white tracking-tight">{selectedTournament.title}</h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedTournament.meta}</p>
              </div>

              {/* TABS SELECT STRIPS */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono self-start md:self-auto overflow-x-auto max-w-full">
                <button onClick={() => setActiveTab('live')} className={`px-3 py-2 rounded-lg font-bold transition-all ${activeTab === 'live' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>● Live Game</button>
                <button onClick={() => setActiveTab('bracket')} className={`px-3 py-2 rounded-lg font-bold transition-all ${activeTab === 'bracket' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>📊 Brackets</button>
                <button onClick={() => setActiveTab('teams')} className={`px-3 py-2 rounded-lg font-bold transition-all ${activeTab === 'teams' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>👥 Rosters</button>
                <button onClick={() => setActiveTab('schedule')} className={`px-3 py-2 rounded-lg font-bold transition-all ${activeTab === 'schedule' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>📅 Schedule</button>
              </div>
            </header>

            {/* CONDITIONAL CONTENT VIEWPORTS */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 min-h-[400px] shadow-2xl">
              
              {/* TAB 1: LIVE GAMES */}
              {activeTab === 'live' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  {selectedTournament.schedule.some((g: any) => g.status === 'live') ? (
                    (() => {
                      const liveGame = selectedTournament.schedule.find((g: any) => g.status === 'live');
                      return (
                        <>
                          <div className="text-center">
                            <span className="bg-red-500 text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse tracking-widest uppercase">
                              Active Matrix Telemetry
                            </span>
                            <h3 className="text-sm font-mono text-slate-400 uppercase mt-2">{liveGame.round} • {liveGame.match}</h3>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">📍 Venue Target: {liveGame.venue}</p>
                          </div>

                          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-3 items-center text-center shadow-inner relative overflow-hidden">
                            <div className="space-y-2">
                              <div className="text-sm font-black text-white truncate uppercase">{liveGame.teamA}</div>
                              <div className="text-5xl font-mono font-black text-emerald-400 bg-slate-950 rounded-xl py-3 border border-slate-800">{demoMatch.scoreA}</div>
                            </div>
                            <div className="text-slate-600 font-mono text-xs font-black tracking-widest">VS</div>
                            <div className="space-y-2">
                              <div className="text-sm font-black text-white truncate uppercase">{liveGame.teamB}</div>
                              <div className="text-5xl font-mono font-black text-emerald-400 bg-slate-950 rounded-xl py-3 border border-slate-800">{demoMatch.scoreB}</div>
                            </div>
                          </div>

                          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                            <p className="text-xs text-slate-400 font-medium text-center">
                              💡 <span className="text-emerald-400 font-bold">Pitch Action:</span> Simulate referee updates:
                            </p>
                            <div className="flex gap-3">
                              <button onClick={() => simulateScore('A')} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold rounded-lg border border-slate-700 transition">
                                +1 Point Team A
                              </button>
                              <button onClick={() => simulateScore('B')} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold rounded-lg border border-slate-700 transition">
                                +1 Point Team B
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div className="bg-slate-900/40 border border-dashed border-slate-800 p-12 rounded-2xl text-center">
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">No active live matches configured for this event entry right now.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BRACKETS */}
              {activeTab === 'bracket' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-black uppercase text-white">Dynamic Tournament Trees</h2>
                    <p className="text-xs text-slate-500 font-mono">bracket tree mappings.</p>
                  </div>
                  {selectedTournament.schedule.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-mono text-xs">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-1">Stage 1: Past Brackets</h4>
                        {selectedTournament.schedule.filter((g: any) => g.status === 'completed').map((match: any) => (
                          <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                            <div className="flex justify-between text-slate-400"><span>{match.teamA}</span><span>{match.scoreA}</span></div>
                            <div className="flex justify-between text-emerald-400 font-bold"><span>{match.teamB} ✓</span><span>{match.scoreB}</span></div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-1">Stage 2: Championship Title</h4>
                        {selectedTournament.schedule.filter((g: any) => g.status === 'live').map((match: any) => (
                          <div key={match.id} className="bg-slate-900 border-2 border-emerald-500/40 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between font-bold text-slate-200"><span>{match.teamA}</span><span className="text-emerald-400 font-mono">{demoMatch.scoreA}</span></div>
                            <div className="flex justify-between font-bold text-slate-200"><span>{match.teamB}</span><span className="text-emerald-400 font-mono">{demoMatch.scoreB}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-mono">No data trees initialized yet.</p>
                  )}
                </div>
              )}

              {/* TAB 3: ROSTERS */}
              {activeTab === 'teams' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-black uppercase text-white">Delegation Roster Sheets</h2>
                    <p className="text-xs text-slate-500 font-mono">Verified rosters for athletic validation credentials.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTournament.teams.map((team: any) => (
                      <div key={team.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                        <h4 className="font-black text-sm uppercase text-white tracking-tight border-b border-slate-800 pb-2">{team.name}</h4>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-400">
                          {team.players.map((p: string, idx: number) => (
                            <div key={idx} className="bg-slate-950/40 p-2 border border-slate-850 rounded-lg">{p}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-black uppercase text-white">Master Operation Timelines</h2>
                    <p className="text-xs text-slate-500 font-mono">Calendar clocks mapped against venue allocations.</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                          <th className="p-4">Time Clock</th>
                          <th className="p-4">Matchup Parameters</th>
                          <th className="p-4">Assigned Venue Arena</th>
                          <th className="p-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {selectedTournament.schedule.map((game: any) => (
                          <tr key={game.id} className="hover:bg-slate-950/20">
                            <td className="p-4 text-slate-300 font-bold">{game.time}</td>
                            <td className="p-4 text-white uppercase font-sans font-bold tracking-tight">{game.teamA} vs {game.teamB}</td>
                            <td className="p-4 text-slate-400 text-[11px]">{game.venue}</td>
                            <td className="p-4 text-right">
                              <span className={`inline-block font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                game.status === 'live' ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' :
                                game.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-slate-500'
                              }`}>{game.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}