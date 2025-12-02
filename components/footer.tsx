import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0f101f]/90 backdrop-blur-md py-12 border-t border-white/5 text-gray-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
                <h2 className="text-white font-black uppercase tracking-tighter text-xl mb-4">
                    Pinya of The Dead
                </h2>
                <p className="max-w-xs mb-4 text-gray-500">
                    A hardcore, immersive Project Zomboid roleplay experience set in a custom exclusion zone.
                </p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-white transition-colors">Discord</a>
                    <a href="#" className="hover:text-white transition-colors">Steam Group</a>
                </div>
            </div>

            {/* Links */}
            <div>
                <h3 className="text-white font-bold uppercase tracking-widest mb-4 text-xs">Navigation</h3>
                <ul className="space-y-2">
                    <li><Link href="/" className="hover:text-[#FED405] transition-colors">Home</Link></li>
                    <li><Link href="/news" className="hover:text-[#FED405] transition-colors">News & Updates</Link></li>
                    <li><Link href="/leaderboards" className="hover:text-[#FED405] transition-colors">Leaderboards</Link></li>
                    <li><Link href="/donate" className="hover:text-[#FED405] transition-colors">Donate</Link></li>
                </ul>
            </div>

            {/* Legal */}
            <div>
                <h3 className="text-white font-bold uppercase tracking-widest mb-4 text-xs">Legal</h3>
                <ul className="space-y-2">
                    <li><Link href="#" className="hover:text-[#FED405] transition-colors">Server Rules</Link></li>
                    <li><Link href="#" className="hover:text-[#FED405] transition-colors">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-[#FED405] transition-colors">Terms of Service</Link></li>
                </ul>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Pinya of The Dead. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Not affiliated with The Indie Stone.</p>
        </div>
    </footer>
  );
}