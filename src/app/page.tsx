'use client';

import Link from 'next/link';

export default function Home() {
  return (
    // Main background set to near-black to anchor the interface
    <div className="min-h-screen bg-[#0f0202] text-red-50 flex flex-col items-center justify-center p-4 xl:p-8 selection:bg-yellow-500/30">
      <div className="max-w-7xl w-full text-center my-2">
        
        {/* Brand Headline */}
        <div className="mb-12">
          <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/10">
            Baham Sports Platform
          </span>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tighter text-white mt-3 uppercase">
            Baham Sports Hub
          </h1>
          <p className="text-xs xl:text-sm text-red-200/70 mt-3 max-w-xl mx-auto">
            The unified operating system for court reservations, tournament structures, live venue streams, and mobile crowd tracking.
          </p>
        </div>

        {/* 9-CARD MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full mx-auto mb-12">
          
          {[
            { href: '/book', icon: '📅', label: 'Court Reservation', tag: 'Rentals', desc: 'Book open court timeslots and check daily calendars.' },
            { href: '/live', icon: '📺', label: 'Live Court Monitor', tag: 'TV Stream', desc: 'Real-time monitor layout for venue TVs.' },
            { href: '/scoreboard', icon: '📱', label: 'Live Scoreboard', tag: 'Audience', desc: 'Mobile-friendly feed for spectators.' },
            { href: '/dashboard', icon: '📊', label: 'Business Analytics', tag: 'Metrics', desc: 'Overview metrics and utilization.' },
            { href: '/tournament/register', icon: '📝', label: 'Team Registration', tag: 'Public', desc: 'Open entry portal for athletes.' },
            { href: '/tournament/bracket', icon: '🏆', label: 'Tournament Bracket', tag: 'Live Sync', desc: 'Real-time bracket tree mapping.' },
            { href: '/admin/matches', icon: '⚔️', label: 'Match Scoring Desk', tag: 'Ops Desk', desc: 'Administrative scoring updates.' },
            { href: '/admin/tournaments', icon: '⚙️', label: 'Tournament Setup', tag: 'Config', desc: 'Approve teams and initialize brackets.' },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="group bg-[#7f1d1d] border border-red-900/50 hover:border-yellow-500/40 p-4 rounded-xl text-left shadow-2xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[10px] font-bold text-yellow-400 font-mono tracking-wider uppercase bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-500/10">{item.tag}</span>
                </div>
                <h3 className="font-bold text-sm text-white mt-3 group-hover:text-yellow-400 transition-colors">{item.label}</h3>
                <p className="text-[11px] text-red-200/70 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          ))}

          {/* 🌟 CARD 9: PUBLIC EVENTS */}
          <Link href="/games" className="group bg-[#7f1d1d] border border-yellow-600/30 p-4 rounded-xl text-left shadow-2xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-red-950 font-bold shadow-md">🏟️</div>
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-500/10 text-yellow-400 font-mono text-[9px] font-black tracking-widest px-2 py-0.5 rounded border border-yellow-500/20 uppercase animate-pulse">Live</span>
            </div>
            <h3 className="mt-3 text-sm font-black uppercase text-white">Public Games Portal</h3>
            <p className="mt-1 text-[11px] text-red-200/70">Immersive multi-sport bracket suite.</p>
          </Link>
        </div>

        {/* Footer */}
        <footer className="border-t border-red-900/50 pt-8 mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-left text-red-200/50 text-[11px]">
          <div><h5 className="text-yellow-500 font-bold mb-2">ABOUT US</h5><p>Our Story<br/>Team<br/>Mission</p></div>
          <div><h5 className="text-yellow-500 font-bold mb-2">SPORTS</h5><p>Basketball<br/>Volleyball<br/>Pickleball</p></div>
          <div><h5 className="text-yellow-500 font-bold mb-2">SUPPORT</h5><p>FAQs<br/>Contact<br/>Rulebooks</p></div>
          <div><h5 className="text-yellow-500 font-bold mb-2">SOCIAL</h5><p>Facebook<br/>Twitter<br/>Instagram</p></div>
        </footer>

        <div className="text-[10px] text-red-900 font-mono pt-8">
          © 2026 BAHAM SPORTS. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
}