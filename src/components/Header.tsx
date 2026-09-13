/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronLeft, ChevronRight, Moon, Sun, ShoppingCart, Share2, Users, Loader2, LogOut, Copy, Check } from 'lucide-react';
import { Theme } from '../types';
import { cn } from '../lib/utils';
import { usePlanner } from '../contexts/PlannerContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { sharePlanner } from '../storage/planner';

export type AppTab = 'planner' | 'recipes';

interface HeaderProps {
  title: string;
  theme: Theme;
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onToggleTheme: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onOpenGrocery: () => void;
  onCopyPreviousWeek?: () => void;
}

export function Header({
  title,
  theme,
  currentTab,
  onTabChange,
  onToggleTheme,
  onPrevWeek,
  onNextWeek,
  onToday,
  onOpenGrocery,
  onCopyPreviousWeek,
}: HeaderProps) {
  const { activePlanner, planners, setActivePlanner, members } = usePlanner();
  const { logOut } = useAuth();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'editor' | 'viewer'>('editor');
  const [shareError, setShareError] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const getInviteUrl = () => {
    if (!activePlanner) return '';
    try {
      const url = new URL(window.location.href);
      url.search = `?join=${encodeURIComponent(activePlanner.id)}`;
      url.hash = '';
      return url.toString();
    } catch {
      return `${window.location.origin}${window.location.pathname}?join=${activePlanner.id}`;
    }
  };

  const handleCopyLink = async () => {
    const url = getInviteUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const handleShare = async () => {
    if (!shareEmail || !activePlanner) return;
    setIsSharing(true);
    setShareError('');
    setShareSuccess('');
    try {
      await sharePlanner(activePlanner.id, shareEmail, shareRole);
      setShareSuccess(`Invited ${shareEmail.trim().toLowerCase()} as ${shareRole}`);
      setShareEmail('');
    } catch(e: any) {
      setShareError(e.message || "Failed to share");
    } finally {
      setIsSharing(false);
    }
  };

  const getInitials = (email: string) => {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-purple-100/70 bg-white/90 backdrop-blur-md shadow-xs dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="hidden rounded-xl bg-linear-to-tr from-violet-500 via-pink-400 to-amber-300 p-2 shadow-xs sm:block cursor-pointer" onClick={() => onTabChange('planner')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-slate-100 cursor-pointer" onClick={() => onTabChange('planner')}>
                Weekly Planner
              </h1>
              {planners.length > 1 && (
                <div className="flex -mt-1">
                  <select 
                    className="text-xs bg-transparent border-none text-slate-500 cursor-pointer focus:ring-0 p-0 hover:text-slate-700 dark:text-slate-400"
                    value={activePlanner?.id || ''}
                    onChange={(e) => {
                      const p = planners.find(x => x.id === e.target.value);
                      if (p) setActivePlanner(p);
                    }}
                  >
                    {planners.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="hidden sm:flex ml-4 rounded-xl bg-purple-50/80 p-1 border border-purple-100/60 dark:bg-slate-800/50 dark:border-transparent">
              <button 
                onClick={() => onTabChange('planner')} 
                className={cn(
                  "px-3.5 py-1 text-sm font-semibold rounded-lg transition-all", 
                  currentTab === 'planner' 
                    ? "bg-white text-violet-700 shadow-sm border border-purple-100/50 dark:bg-slate-700 dark:text-slate-100 dark:border-transparent" 
                    : "text-slate-600 hover:text-violet-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                Planner
              </button>
              <button 
                onClick={() => onTabChange('recipes')} 
                className={cn(
                  "px-3.5 py-1 text-sm font-semibold rounded-lg transition-all", 
                  currentTab === 'recipes' 
                    ? "bg-white text-violet-700 shadow-sm border border-purple-100/50 dark:bg-slate-700 dark:text-slate-100 dark:border-transparent" 
                    : "text-slate-600 hover:text-violet-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                Recipe Library
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {currentTab === 'planner' && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 rounded-xl border border-purple-100/80 bg-purple-50/50 p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900/50">
                  <button
                    onClick={onPrevWeek}
                    title="Previous week"
                    className="rounded-lg px-2 py-1 text-slate-500 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    &larr;
                  </button>
                  <button
                    onClick={onToday}
                    className="rounded-lg bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800 border border-violet-200/70 hover:bg-violet-200/90 dark:bg-slate-800 dark:text-slate-300 dark:border-transparent dark:hover:bg-slate-700"
                  >
                    Today
                  </button>
                  <button
                    onClick={onNextWeek}
                    title="Next week"
                    className="rounded-lg px-2 py-1 text-slate-500 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    &rarr;
                  </button>
                </div>

                {onCopyPreviousWeek && (
                  <button
                    onClick={onCopyPreviousWeek}
                    title="Copy meals from previous week"
                    className="flex items-center gap-1.5 rounded-xl border border-purple-100/80 bg-purple-50/50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-white hover:text-violet-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-violet-400 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Copy Last Week</span>
                  </button>
                )}
              </div>
            )}
            
            {currentTab === 'planner' && (
              <span className="hidden text-sm font-bold text-slate-700 lg:block dark:text-slate-300">
                {title}
              </span>
            )}

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex -space-x-2 mr-2">
                {members.slice(0, 3).map((member) => (
                  <div 
                    key={member.uid} 
                    title={member.email}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-purple-100 text-xs font-bold text-purple-700 dark:border-slate-900 dark:bg-indigo-900/50 dark:text-indigo-300"
                  >
                    {getInitials(member.email)}
                  </div>
                ))}
                {members.length > 3 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-medium text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-400">
                    +{members.length - 3}
                  </div>
                )}
              </div>

              {activePlanner && activePlanner.role === 'owner' && (
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/80 px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-2xs transition-colors hover:bg-sky-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-900"
                >
                  <Share2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="hidden lg:inline">Share</span>
                </button>
              )}

              {currentTab === 'planner' && (
                <button
                  onClick={onOpenGrocery}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs transition-colors hover:bg-emerald-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-900"
                >
                  <ShoppingCart className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Groceries</span>
                </button>
              )}
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs transition-colors hover:bg-amber-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="h-3.5 w-3.5 text-violet-600" />
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Light Mode</span>
                  </>
                )}
              </button>
              <button
                onClick={logOut}
                title="Sign out"
                className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
              <div className="sm:hidden">
                <button 
                  onClick={() => onTabChange(currentTab === 'planner' ? 'recipes' : 'planner')} 
                  className="flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 transition-colors hover:bg-purple-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-900"
                >
                  {currentTab === 'planner' ? 'Library' : 'Planner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {isShareOpen && activePlanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Share Planner</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 mb-4">
              Invite others to view or edit this planner.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
              <input 
                type="email"
                value={shareEmail}
                onChange={e => setShareEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Permission</label>
              <select 
                value={shareRole}
                onChange={(e: any) => setShareRole(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="editor">Editor (Can edit meals and events)</option>
                <option value="viewer">Viewer (Can only view)</option>
              </select>
            </div>
            
            {shareError && <div className="mb-4 text-sm text-red-500">{shareError}</div>}
            {shareSuccess && <div className="mb-4 text-sm text-green-500">{shareSuccess}</div>}
            
            <div className="mb-6 rounded-lg bg-slate-100 p-3.5 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Invite link:</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
              <div className="rounded bg-white p-2 font-mono text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300 break-all border border-slate-200 dark:border-slate-700 select-all">
                {getInviteUrl()}
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Anyone opening this link while signed in will automatically join and collaborate on this planner.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 flex-wrap">
              <button
                onClick={() => setIsShareOpen(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing || !shareEmail}
                className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                Invite User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
