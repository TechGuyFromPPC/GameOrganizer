'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 xl:p-8 selection:bg-emerald-500/30">
      <div className="max-w-7xl w-full text-center my-2">
        
        {/* Brand Headline */}
        <div className="mb-6 xl:mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            Palawan Sports Platform
          </span>
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-white mt-2">
            Baham Sports Hub
          </h1>
          <p className="text-xs xl:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            The unified operating system for court reservations, tournament structures, live venue streams, and mobile crowd tracking.
          </p>
        </div>

        {/* 🚀 8-CARD COMPACT MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full mx-auto mb-6">
          
          {/* 1. Court Booking System -> /book */}
          <Link 
            href="/book" 
            className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-4 rounded-xl text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">📅</span>
                <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-wider uppercase bg-indigo-500/10 px-1.5 py-0.5 rounded">Rentals</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-3 group-hover:text-indigo-400 transition-colors">
                Court Reservation
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Book open court timeslots, select preferred court numbers, and check daily calendars.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 group-hover:text-indigo-400/70 font-mono mt-3 transition-colors">
              → Launch Scheduler
            </div>
          </Link>

          {/* 2. Live Court Status Display -> /live */}
          <Link 
            href="/live" 
            className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-xl text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">📺</span>
                <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-wider uppercase bg-cyan-500/10 px-1.5 py-0.5 rounded">TV Stream</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-3 group-hover:text-cyan-400 transition-colors">
                Live Court Monitor
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Real-time monitor layout designed for venue TVs. Tracks active matches and open courts.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 group-hover:text-cyan-400/70 font-mono mt-3 transition-colors">
              → Stream Display
            </div>
          </Link>

          {/* 3. Public Mobile Scoreboard -> /live */}
          <Link 
            href="/scoreboard"
            className="group bg-slate-900 border border-slate-800 hover:border-teal-500/40 p-4 rounded-xl text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">📱</span>
                <span className="text-[10px] font-bold text-teal-400 font-mono tracking-wider uppercase bg-teal-500/10 px-1.5 py-0.5 rounded">Audience</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-3 group-hover:text-teal-400 transition-colors">
                Live Scoreboard
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Mobile-friendly layout for spectators to follow live points and game trends on their phones.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 group-hover:text-teal-400/70 font-mono mt-3 transition-colors">
              → Open Phone Feed
            </div>
          </Link>

          {/* 4. Analytics & Bookings Dashboard -> /dashboard */}
          <Link 
            href="/dashboard" 
            className="group bg-slate-900 border border-slate-800 hover:border-violet-500/40 p-4 rounded-xl text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">📊</span>
                <span className="text-[10px] font-bold text-violet-400 font-mono tracking-wider uppercase bg-violet-500/10 px-1.5 py-0.5 rounded">Metrics</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-3 group-hover:text-violet-400 transition-colors">
                Business Analytics
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Overview metrics panel compiling transaction histories and court hour utilization analytics.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 group-hover:text-violet-400/70 font-mono mt-3 transition-colors">
              → Review Insights
            </div>
          </Link>

          {/* 5. Player Registration Form -> /tournament/register */}
          <Link 
            href="/tournament/register" 
            className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-xl text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">📝</span>
                <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-wider uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">Public</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-3 group-hover:text-emerald-400 transition-colors">
                Team Registration
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Open entry portal for competitive athletes to submit team rosters and link GCash payments.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 group-hover:text-emerald-400/70 font-mono mt-3 transition-colors">
              → Open Sign-Up
            </div>
          </Link>

          {/* 6. Public Live Bracket Tree -> /tournament/bracket */}
          <Link 
            href="/tournament/bracket" 
            className="group bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-4 rounded-xl text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">🏆</span>
                <span className="text-[10px] font-bold text-blue-400 font-mono tracking-wider uppercase bg-blue-500/10 px-1.5 py-0.5 rounded">Live Sync</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-3 group-hover:text-blue-400 transition-colors">
                Tournament Bracket
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Real-time bracket tree mapping match scores, ongoing sets, and automatic advancements.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 group-hover:text-blue-400/70 font-mono mt-3 transition-colors">
              → View Bracket
            </div>
          </Link>

          {/* 7. Match Operations Desk -> /admin/matches */}
          <Link 
            href="/admin/matches" 
            className="group bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">⚔️</span>
                <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wider uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">Ops Desk</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-3 group-hover:text-amber-400 transition-colors">
                Match Scoring Desk
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Administrative desk to update scores, toggle live statuses, and trigger bracket advancements.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 group-hover:text-amber-400/70 font-mono mt-3 transition-colors">
              → Launch Scoring Engine
            </div>
          </Link>

          {/* 8. Tournament Seeding & Approvals -> /admin/tournaments */}
          <Link 
            href="/admin/tournaments" 
            className="group bg-slate-900 border border-slate-800 hover:border-red-500/40 p-4 rounded-xl text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xl">⚙️</span>
                <span className="text-[10px] font-bold text-red-400 font-mono tracking-wider uppercase bg-red-500/10 px-1.5 py-0.5 rounded">Config</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-3 group-hover:text-red-400 transition-colors">
                Tournament Setup
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Approve newly registered teams, manage tournament details, and initialize clean brackets.
              </p>
            </div>
            <div className="text-[10px] text-slate-600 group-hover:text-red-400/70 font-mono mt-3 transition-colors">
              → Access Panel
            </div>
          </Link>


{/* 🌟 NEW CARD 9: PUBLIC EVENTS PORTAL SHIFT */}
<Link 
  href="/games" 
            className="group bg-slate-900 border border-slate-800 hover:border-red-500/40 p-4 rounded-xl text-left shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
>
  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
    🏟️
  </div>
  
  <div className="absolute top-6 right-6">
    <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-black tracking-widest px-2 py-0.5 rounded border border-emerald-500/20 uppercase animate-pulse">
      Live Showcase
    </span>
  </div>

  <h3 className="mt-4 text-sm font-black uppercase text-white tracking-tight">
    Public Games Portal <span className="text-emerald-400 font-mono font-medium lowercase">/games</span>
  </h3>
  <p className="mt-2 text-xs leading-relaxed text-slate-400">
    Launch the immersive, fan-facing multi-sport bracket suite. Ideal for projecting on stadium jumbotrons or pitching live to tournament hosts.
  </p>
  
   <div className="text-[10px] text-slate-600 group-hover:text-red-400/70 font-mono mt-3 transition-colors">
              → Access Panel
            </div>
</Link>

        </div>

        {/* Footer info metadata */}
        <div className="text-[10px] text-slate-600 font-mono border-t border-slate-900 pt-4 mt-4">
          System Core: Next.js v16 + Supabase Relational Cluster Engine
        </div>

      </div>
    </div>
  );
}