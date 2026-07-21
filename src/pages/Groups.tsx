import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, Search, Trash2, Bell, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

type Group = {
  id: string;
  name: string;
  owner_id: string;
  theme: string;
};

type GroupMember = {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    username: string;
    display_name: string;
  };
};

type GroupInvite = {
  id: string;
  group_id: string;
  from_user_id: string;
  groups: {
    name: string;
  };
  profiles: {
    username: string;
    display_name: string;
  };
};

export const Groups: React.FC = () => {
  const { user } = useAuth();
  const { designSystem } = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [groupActivity, setGroupActivity] = useState<Record<string, any[]>>({});
  
  const [newGroupName, setNewGroupName] = useState('');
  
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchInvites();
    }
  }, [user]);

  useEffect(() => {
    if (activeGroupId) fetchMembers(activeGroupId);
  }, [activeGroupId]);

  useEffect(() => {
    if (members.length > 0) {
      fetchGroupActivity(members);
    } else {
      setGroupActivity({});
    }
  }, [members]);

  const fetchGroups = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('groups(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const userGroups = data.map((item: any) => item.groups).filter(Boolean);
      setGroups(userGroups);
      if (userGroups.length > 0 && !activeGroupId) {
        setActiveGroupId(userGroups[0].id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchInvites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('group_invites')
        .select('*, groups(name), profiles!group_invites_from_user_id_fkey(username, display_name)')
        .eq('to_user_id', user.id);

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*, profiles!group_members_user_id_fkey(username, display_name)')
        .eq('group_id', groupId);

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchGroupActivity = async (currentMembers: GroupMember[]) => {
    if (!currentMembers.length) return;
    const userIds = currentMembers.map(m => m.user_id);
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('user_id', userIds);

      if (tasksError) throw tasksError;

      const { data: logsData, error: logsError } = await supabase
        .from('task_logs')
        .select('*')
        .in('user_id', userIds)
        .eq('date', today);

      if (logsError) throw logsError;

      const activityMap: Record<string, any[]> = {};
      userIds.forEach(uid => { activityMap[uid] = []; });

      tasksData?.forEach(task => {
        const log = logsData?.find(l => l.task_id === task.id);
        if (activityMap[task.user_id]) {
          activityMap[task.user_id].push({
            ...task,
            completed: !!log?.completed
          });
        }
      });

      setGroupActivity(activityMap);
    } catch (error) {
      console.error('Error fetching group activity:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGroupName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{ name: newGroupName.trim(), owner_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: data.id, user_id: user.id, role: 'owner' }]);
        
      if (memberError && !memberError.message.includes('duplicate')) {
        console.warn('Failed to add to group_members:', memberError);
      }

      setGroups([...groups, data]);
      setActiveGroupId(data.id);
      setNewGroupName('');
    } catch (error: any) {
      console.error('Error creating group:', error);
      alert('Error creating group: ' + error.message);
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroupId) return;
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', activeGroupId);

      if (error) throw error;
      
      const remainingGroups = groups.filter(g => g.id !== activeGroupId);
      setGroups(remainingGroups);
      setActiveGroupId(remainingGroups.length > 0 ? remainingGroups[0].id : null);
    } catch (error: any) {
      alert('Error deleting group: ' + error.message);
    }
  };

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .ilike('username', `%${searchUsername}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleInvite = async (toUserId: string) => {
    if (!activeGroupId || !user) return;
    try {
      const { error } = await supabase
        .from('group_invites')
        .insert([{
          group_id: activeGroupId,
          from_user_id: user.id,
          to_user_id: toUserId
        }]);

      if (error) {
        if (error.message.includes('duplicate key value')) {
          throw new Error('An invite has already been sent to this user.');
        }
        throw error;
      }
      alert('Invite sent!');
      setSearchResults([]);
      setSearchUsername('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAcceptInvite = async (invite: GroupInvite) => {
    if (!user) return;
    try {
      // 1. Insert into group_members
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: invite.group_id, user_id: user.id, role: 'member' }]);
        
      if (memberError && !memberError.message.includes('duplicate')) throw memberError;

      // 2. Delete invite
      await supabase.from('group_invites').delete().eq('id', invite.id);

      setInvites(invites.filter(i => i.id !== invite.id));
      fetchGroups(); // Refresh groups so the new one appears
    } catch (error: any) {
      alert('Error accepting invite: ' + error.message);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await supabase.from('group_invites').delete().eq('id', inviteId);
      setInvites(invites.filter(i => i.id !== inviteId));
    } catch (error: any) {
      alert('Error declining invite: ' + error.message);
    }
  };

  const isBrutal = designSystem === 'brutal';
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const isOwner = activeGroup?.owner_id === user?.id;

  return (
    <div className="space-y-6">
      
      {invites.length > 0 && (
        <div className={cn("ui-panel p-6 border-l-4", isBrutal ? "border-[var(--accent-brutal)]" : "border-[var(--accent)]")}>
          <h2 className="text-2xl mb-4 flex items-center gap-2 font-bold">
            <Bell className="text-[var(--accent)]" /> Pending Invites
          </h2>
          <div className="space-y-3">
            {invites.map(invite => (
              <div key={invite.id} className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4",
                isBrutal ? "bg-[var(--background)] border-2 border-black" : "rounded-lg bg-white/10"
              )}>
                <div>
                  <div className="font-bold text-lg">{invite.groups?.name || 'Unknown Group'}</div>
                  <div className="text-sm opacity-70">
                    Invited by @{invite.profiles?.username || 'Unknown'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptInvite(invite)}
                    className={cn(
                      "px-4 py-2 font-bold",
                      isBrutal ? "ui-button bg-[var(--success-brutal)] text-black" : "bg-[var(--success)]/20 text-[var(--success)] rounded-xl hover:bg-[var(--success)]/40"
                    )}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite.id)}
                    className={cn(
                      "px-4 py-2 font-bold",
                      isBrutal ? "ui-button bg-red-400 text-black" : "bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/40"
                    )}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ui-panel p-6">
        <h1 className="text-3xl mb-6 flex items-center gap-3 font-bold">
          <Users className={cn(isBrutal ? "text-foreground" : "text-[var(--accent)]")} /> My Groups
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex gap-2">
            <select
              value={activeGroupId || ''}
              onChange={(e) => setActiveGroupId(e.target.value)}
              className={cn(
                "flex-1 p-3 text-foreground focus:outline-none",
                isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
              )}
            >
              <option value="" disabled>Select a group...</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {isOwner && (
              <button
                onClick={handleDeleteGroup}
                title="Delete Group"
                className={cn(
                  "p-3 flex items-center justify-center text-red-500",
                  isBrutal ? "ui-button border-red-500 hover:bg-red-500 hover:text-white" : "rounded-xl border border-red-500/30 hover:bg-red-500/10 transition-colors"
                )}
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
          <form onSubmit={handleCreateGroup} className="flex gap-2">
            <input
              type="text"
              placeholder="New group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className={cn(
                "p-3 text-foreground focus:outline-none w-full md:w-auto",
                isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
              )}
            />
            <button
              type="submit"
              className={cn(
                "px-6 py-3 font-semibold",
                isBrutal ? "ui-button bg-[var(--accent)] text-white" : "rounded-xl bg-[var(--accent)]/80 text-white hover:bg-[var(--accent)] transition-colors"
              )}
            >
              Create
            </button>
          </form>
        </div>

        {activeGroupId && (
          <div className="mt-8 border-t border-gray-300/20 pt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl mb-4 font-bold">Members</h3>
                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.id} className={cn(
                      "flex items-center gap-4 p-4",
                      isBrutal ? "ui-panel !bg-[var(--background)]" : "rounded-lg bg-white/10"
                    )}>
                      <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {member.profiles?.display_name?.charAt(0) || member.profiles?.username?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{member.profiles?.display_name || member.profiles?.username || 'Unknown User'}</div>
                        <div className="text-sm opacity-70 font-medium">@{member.profiles?.username || 'unknown'} • {member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl mb-4 flex items-center gap-2 font-bold">
                  <UserPlus size={24} /> Invite Friends
                </h3>
                <form onSubmit={handleSearchUsers} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    placeholder="Search username..."
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className={cn(
                      "flex-1 p-3 text-foreground focus:outline-none",
                      isBrutal ? "ui-panel" : "rounded-xl border border-gray-300/30 bg-white/20 focus:ring-2 focus:ring-[var(--accent)]"
                    )}
                  />
                  <button type="submit" className={cn(
                    "p-3 flex items-center justify-center",
                    isBrutal ? "ui-button bg-[var(--accent)] text-white" : "rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                  )}>
                    <Search size={20} />
                  </button>
                </form>

                <div className="space-y-3">
                  {searchResults.map(res => (
                    <div key={res.id} className={cn(
                      "flex items-center justify-between p-4",
                      isBrutal ? "ui-panel !bg-[var(--background)]" : "rounded-lg bg-white/5 border border-white/10"
                    )}>
                      <div>
                        <div className="font-bold">{res.display_name || res.username}</div>
                        <div className="text-sm opacity-70 font-medium">@{res.username}</div>
                      </div>
                      <button
                        onClick={() => handleInvite(res.id)}
                        className={cn(
                          "px-4 py-2 font-bold",
                          isBrutal ? "ui-button bg-[var(--accent-brutal)]" : "bg-[var(--accent)]/20 text-[var(--accent)] rounded-full hover:bg-[var(--accent)]/40 transition-colors"
                        )}
                      >
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-300/20">
              <h3 className="text-2xl mb-6 font-bold">Today's Group Activity</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {members.map(member => {
                  const tasks = groupActivity[member.user_id] || [];
                  return (
                    <div key={member.id} className={cn(
                      "p-5 flex flex-col h-full",
                      isBrutal ? "ui-panel !bg-[var(--background)]" : "rounded-xl bg-white/5 border border-white/10"
                    )}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                          {member.profiles?.display_name?.charAt(0) || member.profiles?.username?.charAt(0) || '?'}
                        </div>
                        <div className="font-bold truncate">
                          {member.profiles?.display_name || member.profiles?.username}
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {tasks.length === 0 ? (
                          <div className="text-sm opacity-50 italic">No tasks set up.</div>
                        ) : (
                          tasks.map(task => (
                            <div key={task.id} className="flex items-start gap-2 text-sm">
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 opacity-30 shrink-0" />
                              )}
                              <span className={cn(
                                "leading-tight",
                                task.completed ? "opacity-50 line-through" : "font-medium"
                              )}>
                                {task.title}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
