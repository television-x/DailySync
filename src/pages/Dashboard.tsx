import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Plus, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

type Task = {
  id: string;
  title: string;
  completion_mode: 'checkbox' | 'progress-only';
};

type TaskLog = {
  id: string;
  task_id: string;
  completed: boolean;
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { designSystem } = useTheme();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Record<string, TaskLog>>({});
  const [loading, setLoading] = useState(true);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMode, setNewTaskMode] = useState<'checkbox' | 'progress-only'>('checkbox');

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      fetchTasksAndLogs();
    }
  }, [user]);

  const fetchTasksAndLogs = async () => {
    setLoading(true);
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      const { data: logsData, error: logsError } = await supabase
        .from('task_logs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today);

      if (logsError) throw logsError;
      
      const logsMap: Record<string, TaskLog> = {};
      logsData?.forEach(log => {
        logsMap[log.task_id] = log;
      });
      setLogs(logsMap);

    } catch (error: any) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: newTaskTitle.trim(),
          completion_mode: newTaskMode
        }])
        .select()
        .single();

      if (error) throw error;
      setTasks([...tasks, data]);
      setNewTaskTitle('');
    } catch (error: any) {
      console.error('Error creating task:', error);
      alert('Error creating task: ' + error.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    if (!user) return;
    
    const existingLog = logs[taskId];
    const newCompletedState = existingLog ? !existingLog.completed : true;

    try {
      if (existingLog) {
        const { error } = await supabase
          .from('task_logs')
          .update({ completed: newCompletedState })
          .eq('id', existingLog.id);
          
        if (error) throw error;
        setLogs({
          ...logs,
          [taskId]: { ...existingLog, completed: newCompletedState }
        });
      } else {
        const { data, error } = await supabase
          .from('task_logs')
          .insert([{
            task_id: taskId,
            user_id: user.id,
            date: today,
            completed: newCompletedState
          }])
          .select()
          .single();
          
        if (error) throw error;
        setLogs({
          ...logs,
          [taskId]: data
        });
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const logProgress = async (taskId: string) => {
    if (!user) return;
    const existingLog = logs[taskId];
    
    try {
      if (existingLog) {
        alert('Already logged today!');
        return;
      }

      const { data, error } = await supabase
        .from('task_logs')
        .insert([{
          task_id: taskId,
          user_id: user.id,
          date: today,
          completed: true,
          note: 'Progress logged'
        }])
        .select()
        .single();
        
      if (error) throw error;
      setLogs({
        ...logs,
        [taskId]: data
      });
    } catch (error) {
      console.error('Error logging progress:', error);
    }
  };

  const isBrutal = designSystem === 'brutal';
  const transitionProps: any = isBrutal 
    ? { duration: 0.1, ease: 'linear' } 
    : { duration: 0.3, type: 'spring', bounce: 0.4 };

  return (
    <div className="space-y-6">
      <div className="ui-panel p-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl mb-1">Today</h1>
          <p className="opacity-70 font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
      </div>

      <div className="ui-panel p-6">
        <form onSubmit={handleCreateTask} className="flex gap-2 mb-8 flex-wrap">
          <input
            type="text"
            placeholder="Add a new daily task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className={cn(
              "flex-1 p-3 text-foreground focus:outline-none min-w-[200px]",
              isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
            )}
          />
          <select
            value={newTaskMode}
            onChange={(e) => setNewTaskMode(e.target.value as any)}
            className={cn(
              "p-3 text-foreground focus:outline-none min-w-[120px]",
              isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20"
            )}
          >
            <option value="checkbox">Checkbox</option>
            <option value="progress-only">Log only</option>
          </select>
          <button
            type="submit"
            className="ui-button p-3 flex items-center justify-center min-w-[50px] bg-[var(--accent)] text-white"
          >
            <Plus size={24} />
          </button>
        </form>

        {loading ? (
          <div className="text-center py-8 opacity-70">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 opacity-70">No daily tasks set up yet. Create one above!</div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {tasks.map(task => {
                const isCompleted = logs[task.id]?.completed;

                return (
                  <motion.div 
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: isBrutal ? 0 : 20, x: isBrutal ? -20 : 0 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.1 } }}
                    transition={transitionProps}
                    className={cn(
                      "group flex items-center justify-between p-4 transition-colors",
                      isBrutal 
                        ? "ui-panel !bg-[var(--background)] hover:!bg-black/5 dark:hover:!bg-white/5" 
                        : "rounded-xl bg-white/10 border border-white/5 hover:bg-white/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {task.completion_mode === 'checkbox' ? (
                        <button
                          onClick={() => toggleTaskCompletion(task.id)}
                          className={cn(
                            "flex items-center justify-center w-8 h-8 transition-all flex-shrink-0",
                            isBrutal ? "border-[3px] border-[var(--foreground)]" : "border-2 rounded-full",
                            isCompleted 
                              ? isBrutal 
                                  ? "bg-[var(--success-brutal)] text-black" 
                                  : "bg-[var(--success)] border-[var(--success)] text-white scale-110" 
                              : isBrutal
                                  ? "bg-transparent shadow-[4px_4px_0px_0px_currentColor] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_currentColor]"
                                  : "border-gray-400 text-transparent hover:border-[var(--accent)]"
                          )}
                        >
                          <Check size={20} className={cn(
                            "transition-all", 
                            isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                            isBrutal && "stroke-[3px]"
                          )} />
                        </button>
                      ) : (
                        <button
                          onClick={() => logProgress(task.id)}
                          disabled={isCompleted}
                          className={cn(
                            "px-4 py-2 text-sm transition-all whitespace-nowrap",
                            isBrutal ? "ui-button font-bold border-[3px]" : "rounded-full font-medium border",
                            isCompleted
                              ? isBrutal ? "!bg-[var(--success-brutal)] !text-black !translate-x-[4px] !translate-y-[4px] !shadow-none" : "bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30 scale-105"
                              : isBrutal ? "" : "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent)]/30"
                          )}
                        >
                          {isCompleted ? 'Logged' : 'Log Progress'}
                        </button>
                      )}
                      <span className={cn(
                        "text-lg transition-all duration-300 font-medium",
                        isCompleted && task.completion_mode === 'checkbox' ? 'line-through opacity-50' : ''
                      )}>
                        {task.title}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className={cn(
                        "p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 sm:opacity-100",
                        isBrutal ? "border-[3px] border-red-500 hover:bg-red-500 hover:text-white" : "hover:bg-red-400/10 rounded-lg"
                      )}
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
