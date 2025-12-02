import { login } from '@/actions/login';


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#191A30] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#131426] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-[#FED405]"></div>
         
         <div className="text-center mb-8">
           <h1 className="text-3xl font-black text-white tracking-tighter">POTD <span className="text-[#FED405]">ADMIN</span></h1>
           <p className="text-gray-500 text-sm mt-2">Authorized Personnel Only</p>
         </div>

         <form action={login} className="space-y-6">
           <div>
             <label className="block text-sm font-bold text-gray-300 mb-2 uppercase">Email</label>
             <input 
               name="email" 
               type="email" 
               required 
               className="w-full bg-[#191A30] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-[#FED405] transition-colors"
               placeholder="admin@potd.com"
             />
           </div>
           
           <div>
             <label className="block text-sm font-bold text-gray-300 mb-2 uppercase">Password</label>
             <input 
               name="password" 
               type="password" 
               required 
               className="w-full bg-[#191A30] border border-white/10 text-white px-4 py-3 focus:outline-none focus:border-[#FED405] transition-colors"
               placeholder="••••••••"
             />
           </div>

           <button 
             type="submit"
             className="w-full bg-[#FED405] text-[#191A30] font-bold py-3 uppercase tracking-wider hover:bg-[#e5c004] transition-colors"
           >
             Authenticate
           </button>
         </form>
      </div>
    </div>
  );
}
