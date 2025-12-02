'use client';

import { useState } from 'react';
import PostManager from './post-manager';
import EventManager from './event-manager';
import RankManager from './rank-manager';
import DiscountManager from './discount-manager';
import LeaderboardManager from './leaderboard-manager';
import { Post, Event, Rank, SaleConfig, LeaderboardConfig, FactionScoreConfig, Season, BlacklistEntry } from '@/types';
import { Radio, Calendar, DollarSign, Tag, Trophy } from 'lucide-react';

export default function DashboardTabs({ 
  posts, 
  events,
  ranks,
  saleConfig,
  leaderboardConfigs,
  factionScoring,
  seasons,
  blacklist
}: { 
  posts: Post[], 
  events: Event[],
  ranks: Rank[],
  saleConfig: SaleConfig,
  leaderboardConfigs: LeaderboardConfig[],
  factionScoring: FactionScoreConfig,
  seasons: Season[],
  blacklist: BlacklistEntry[]
}) {
  const [activeTab, setActiveTab] = useState<'news' | 'events' | 'donations' | 'discounts' | 'leaderboards'>('news');

  return (
    <div>
      <div className="flex gap-4 border-b border-white/5 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('news')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'news' ? 'text-[#FED405] border-b-2 border-[#FED405]' : 'text-gray-400 hover:text-white'}`}
        >
          <Radio size={16} /> Manage News
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'events' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
        >
          <Calendar size={16} /> Manage Events
        </button>
        <button 
          onClick={() => setActiveTab('donations')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'donations' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-white'}`}
        >
          <DollarSign size={16} /> Manage Donations
        </button>
        <button 
          onClick={() => setActiveTab('discounts')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'discounts' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
        >
          <Tag size={16} /> Manage Discounts
        </button>
        <button 
          onClick={() => setActiveTab('leaderboards')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'leaderboards' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400 hover:text-white'}`}
        >
          <Trophy size={16} /> Manage Leaderboards
        </button>
      </div>

      {activeTab === 'news' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PostManager initialPosts={posts} />
        </div>
      )}
      
      {activeTab === 'events' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <EventManager initialEvents={events} />
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RankManager initialRanks={ranks} />
        </div>
      )}

      {activeTab === 'discounts' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DiscountManager ranks={ranks} saleConfig={saleConfig} />
        </div>
      )}

      {activeTab === 'leaderboards' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LeaderboardManager configs={leaderboardConfigs} factionScoring={factionScoring} seasons={seasons} blacklist={blacklist} />
        </div>
      )}
    </div>
  );
}
