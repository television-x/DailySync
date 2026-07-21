import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { designSystem } = useTheme();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the login link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const isBrutal = designSystem === 'brutal';

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className={cn("w-full max-w-md p-8", isBrutal ? "ui-panel" : "glass-panel")}>
        <h1 className={cn("mb-8 text-center font-bold", isBrutal ? "text-4xl" : "text-3xl")}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full p-3 text-foreground focus:outline-none",
                isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
              )}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full p-3 text-foreground focus:outline-none",
                isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
              )}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full p-4 font-bold text-lg",
              isBrutal ? "ui-button bg-[var(--accent)] text-white" : "rounded-xl bg-[var(--accent)]/80 text-white hover:bg-[var(--accent)] transition-colors"
            )}
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className={cn(
              "font-medium hover:underline",
              isBrutal ? "text-foreground" : "text-[var(--accent)]"
            )}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
