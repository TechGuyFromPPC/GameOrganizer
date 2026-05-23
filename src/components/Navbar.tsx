'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  return (
    <nav className="relative z-50 border-b border-red-900 bg-[#0f0202]/80 backdrop-blur-md px-6 py-4 w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {!isHomepage && (
            <button onClick={() => router.back()} className="px-3 py-1.5 text-[10px] font-black uppercase bg-[#7f1d1d] border border-red-900 rounded-lg text-red-200 hover:text-white">◀ Back</button>
          )}
          <Link href="/" className="font-black text-sm text-white tracking-widest uppercase hover:text-yellow-400">🏠 Portal</Link>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-red-950/50 border border-red-900 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
          <span className="text-[9px] font-black uppercase tracking-widest text-red-300">System Live</span>
        </div>
      </div>
    </nav>
  );
}