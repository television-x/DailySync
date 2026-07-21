import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { subDays, format } from 'date-fns';
import { cn } from '../lib/utils';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { bgTheme, setBgTheme, designSystem, setDesignSystem } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [heatmapValues, setHeatmapValues] = useState<any[]>([]);

  useEffect(() => {
    async function getProfile() {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('username, display_name, theme_preference')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setUsername(data.username);
          setDisplayName(data.display_name || '');
          if (data.theme_preference) {
            setBgTheme(data.theme_preference as any);
          }
        }
      } catch (error) {
        console.warn('Error loading user data', error);
      } finally {
        setLoading(false);
      }
    }
    
    async function getHeatmapData() {
      if (!user) return;
      const oneYearAgo = format(subDays(new Date(), 365), 'yyyy-MM-dd');
      try {
        const { data, error } = await supabase
          .from('task_logs')
          .select('date, completed')
          .eq('user_id', user.id)
          .eq('completed', true)
          .gte('date', oneYearAgo);
          
        if (error) throw error;
        
        const counts: Record<string, number> = {};
        data?.forEach((log) => {
          counts[log.date] = (counts[log.date] || 0) + 1;
        });
        
        const formattedData = Object.entries(counts).map(([date, count]) => ({
          date,
          count
        }));
        
        setHeatmapValues(formattedData);
      } catch (error) {
        console.warn('Error loading heatmap', error);
      }
    }
    
    getProfile();
    getHeatmapData();
  }, [user, setBgTheme]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setLoading(true);
      const updates = {
        id: user.id,
        username,
        display_name: displayName,
        theme_preference: bgTheme,
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      alert('Profile updated!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isBrutal = designSystem === 'brutal';

  return (
    <div className="space-y-6">
      <div className="ui-panel p-6">
        <h2 className="text-3xl mb-6">Profile Settings</h2>
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username (for friends to find you)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(
                "w-full p-3 text-foreground focus:outline-none",
                isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
              )}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={cn(
                "w-full p-3 text-foreground focus:outline-none",
                isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">App Theme (Background)</label>
            <select
              value={bgTheme}
              onChange={(e) => setBgTheme(e.target.value as any)}
              className={cn(
                "w-full p-3 text-foreground focus:outline-none",
                isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
              )}
            >
              <option value="default">Default</option>
              <option value="hello-kitty">Hello Kitty</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">UI Style</label>
            <select
              value={designSystem}
              onChange={(e) => setDesignSystem(e.target.value as any)}
              className={cn(
                "w-full p-3 text-foreground focus:outline-none",
                isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
              )}
            >
              <option value="glass">Glassmorphism (Smooth)</option>
              <option value="brutal">Neobrutalism (Hard & Bold)</option>
            </select>
            <p className="text-xs opacity-60 mt-1">Note: Background animations are disabled in Brutalism mode.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="ui-button w-full p-3 mt-4 text-center bg-[var(--accent)] text-white"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="ui-panel p-6 overflow-x-auto">
        <h3 className="text-2xl mb-4">Consistency Calendar</h3>
        <div className="min-w-[600px] text-xs font-mono">
          <CalendarHeatmap
            startDate={subDays(new Date(), 365)}
            endDate={new Date()}
            values={heatmapValues}
            classForValue={(value) => {
              if (!value || value.count === 0) {
                return 'color-empty';
              }
              return `color-scale-${Math.min(value.count, 4)}`;
            }}
            titleForValue={(value) => {
              if (!value) return 'No tasks completed';
              return `${value.count} tasks completed on ${value.date}`;
            }}
          />
        </div>
      </div>
      
      <style>{`
        /* Default Glass */
        .react-calendar-heatmap .color-empty { fill: rgba(150, 150, 150, 0.1); rx: 2px; }
        .react-calendar-heatmap .color-scale-1 { fill: var(--accent); opacity: 0.4; rx: 2px; }
        .react-calendar-heatmap .color-scale-2 { fill: var(--accent); opacity: 0.6; rx: 2px; }
        .react-calendar-heatmap .color-scale-3 { fill: var(--accent); opacity: 0.8; rx: 2px; }
        .react-calendar-heatmap .color-scale-4 { fill: var(--accent); opacity: 1; rx: 2px; }
        .dark .react-calendar-heatmap .color-empty { fill: rgba(255, 255, 255, 0.05); }

        /* Brutalism Overrides */
        .design-brutal .react-calendar-heatmap .color-empty { fill: transparent; stroke: var(--foreground); stroke-width: 1px; rx: 0px; }
        .design-brutal .react-calendar-heatmap .color-scale-1 { fill: var(--accent-brutal); opacity: 0.4; stroke: var(--foreground); stroke-width: 1px; rx: 0px; }
        .design-brutal .react-calendar-heatmap .color-scale-2 { fill: var(--accent-brutal); opacity: 0.6; stroke: var(--foreground); stroke-width: 1px; rx: 0px; }
        .design-brutal .react-calendar-heatmap .color-scale-3 { fill: var(--accent-brutal); opacity: 0.8; stroke: var(--foreground); stroke-width: 1px; rx: 0px; }
        .design-brutal .react-calendar-heatmap .color-scale-4 { fill: var(--accent-brutal); opacity: 1; stroke: var(--foreground); stroke-width: 1px; rx: 0px; }
      `}</style>
    </div>
  );
};
