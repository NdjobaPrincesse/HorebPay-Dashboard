import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { login } from '../api/auth'; 

const LoginPage = () => {
  const [email, setEmail] = useState(''); // Changed from username
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Pass email and password (which will be mapped to motDePasse in api/auth.ts)
      await login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      console.error("Login Failed:", err);
      if (err.response && err.response.status === 404) {
          setError("Server endpoint not found. Check proxy.");
      } else if (err.response && err.response.status === 401) {
          setError("Invalid email or password.");
      } else {
          setError("Login failed. Check your connection.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white">
      {/* LEFT SIDE: FORM */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24">
        
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-3xl font-bold tracking-tight text-blue-950">
              HOREB<span className="text-[#FFC107]">PAY</span>
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in to manage your financial operations.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email" // Changed to email type
                required
                className="block w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 text-gray-900 outline-none transition-all 
                focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20"
                placeholder="leroi22@gmail.com" // Updated placeholder
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                className="block w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 text-gray-900 outline-none transition-all 
                focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#FFC107] focus:ring-[#FFC107]" />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-500">Remember me</label>
            </div>
            <a href="#" className="text-sm font-semibold text-blue-900 hover:text-[#FFC107] transition-colors">Forgot password?</a>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full bg-red-600" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-lg bg-[#FFC107] py-3 px-4 text-sm font-bold text-blue-950 shadow-lg shadow-amber-500/20 transition-all 
            hover:bg-[#FFC107]/90 hover:shadow-amber-500/30 
            focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Need access? <a href="#" className="font-semibold text-blue-900 hover:text-[#FFC107] transition-colors">Contact IT Support</a>
        </p>
      </div>

      {/* RIGHT SIDE (Keep your existing design) */}
            <div className="hidden w-1/2 flex-col justify-between bg-blue-950 p-12 lg:flex relative overflow-hidden">
        
        {/* --- YELLOW SHAPES --- */}
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#FFC107]/20 blur-[120px]" />
        <div className="absolute top-[10%] right-[-5%] h-[300px] w-[300px] rounded-full border-[2px] border-[#FFC107]/20" />
        <div className="absolute top-[30%] right-[10%] h-12 w-12 rounded-full bg-[#FFC107]/80 blur-md" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-[#FFC107]/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#FFC107 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="relative z-10"></div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold leading-tight text-white mb-6">
            The modern standard for financial operations.
          </h2>
          <p className="text-lg text-blue-200 leading-relaxed">
            "HorebPay gives us the visibility and control we need to manage thousands of daily transactions with zero friction."
          </p>
          <div className="mt-8 flex items-center gap-4">
             <div>
                <p className="text-white font-semibold">Borel T.</p>
                <p className="text-blue-300 text-sm">Lead Developer</p>
             </div>
          </div>
        </div>
        
        <div className="relative z-10 text-xs text-blue-400">
           © {new Date().getFullYear()} HorebPay Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;