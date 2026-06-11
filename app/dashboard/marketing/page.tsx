'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Users,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';

// ------------------ Types ------------------
type IconKey = 'BarChart3' | 'Users' | 'DollarSign';

type Stat = {
  label: string;
  value: string;
  trend: string;
  trendColor: string;
  icon: IconKey;
  description: string;
};

// ------------------ Component ------------------
export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState<Stat[]>([]);
  const [campaignLine, setCampaignLine] = useState<any[]>([]);
  const [campaignBar, setCampaignBar] = useState<any[]>([]);
  const [topChannels, setTopChannels] = useState<any[]>([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<any[]>([]);
  const [externalLinks, setExternalLinks] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Type-safe icons map
  const iconsMap: Record<IconKey, React.ElementType> = { BarChart3, Users, DollarSign };

  // ------------------ Fetch Data ------------------
  // ------------------ Fetch Data ------------------
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/dashboard`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setStats(data.stats || []);
        setCampaignLine(data.campaignLine || []);
        setCampaignBar(data.campaignBar || []);
        setTopChannels(data.topChannels || []);
        setFeaturedCampaigns(data.featuredCampaigns || []);
        setExternalLinks(data.externalLinks || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);
  // ------------------ Click Outside Menu ------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) return <p className="text-white p-6">Loading dashboard...</p>;
  if (error) return <p className="text-red-500 p-6">Error loading dashboard: {error}</p>;
  if (!stats.length) return <p className="text-white p-6">No data available.</p>;

  // ------------------ Render ------------------
  return (
    <div className="p-3 dark:bg-gray-900 min-h-screen space-y-6">
      {/* Highlights Section */}
      <div className="dark:bg-gray-900 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl mb-2 font-bold text-gray-900 dark:text-white">Highlights</h2>
            <p className="text-base text-gray-500 dark:text-gray-400">Latest social statistics</p>
          </div>

          {/* Global Edit/Delete Menu */}
          <div className="relative" ref={menuRef}>
            <button
              className="text-gray-400 w-9 h-8 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreHorizontal className="w-full h-full rounded bg-white" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </button>
                <button className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-sm">
              <div className="flex items-center w-8 gap-3 mb-4">
                {iconsMap[stat.icon] && React.createElement(iconsMap[stat.icon], { className: 'w-6 h-6 text-indigo-600' })}
              </div>
              <h4 className="text-gray-600 mt-5 mb-2 dark:text-gray-300 text-xl font-medium">{stat.label}</h4>
              <p className="text-2xl font-bold text-gray-900 mb-3 dark:text-white">{stat.value}</p>
              <p className={`text-sm mt-1 ${stat.trendColor}`}>{stat.trend} <span className="text-gray-500 dark:text-gray-400 ml-1">{stat.description}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* External Links + Campaign Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
        {/* External Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex border-b border-gray-200 dark:border-gray-700 justify-between items-center p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">External Links</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Most used resources</p>
            </div>
            <button><MoreHorizontal className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="py-5 px-3">
            {externalLinks.map((link, idx) => (
              <div key={idx} className="flex justify-between items-center p-5">
                <div className="flex items-center gap-3">
                  <img src={link.icon} alt={link.name} className="w-6 h-6 rounded" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{link.name}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Campaign FacebookAds</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={campaignBar}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} domain={[0, 'dataMax + 50']} />
              <Tooltip />
              <Bar dataKey="FacebookAds" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart for Campaign */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-2">Campaign Performance</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={campaignLine}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="FacebookAds" stroke="#6366f1" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="GoogleAds" stroke="#8b5cf6" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Channels Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-semibold dark:text-white mb-4">Top Channels</h2>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 dark:text-white border-b">
              <th className="py-3">SOURCE</th>
              <th className="py-3">FacebookAds</th>
              <th className="py-3">REVENUES</th>
              <th className="py-3">SALES</th>
              <th className="py-3">CONVERSION</th>
            </tr>
          </thead>
          <tbody>
            {topChannels.map((channel, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="py-4 font-medium dark:text-white text-gray-800 flex items-center gap-3">
                  <Image src={channel.icon} alt={channel.source} width={20} height={20} className="rounded-full" />
                  {channel.source}
                </td>
                <td className="py-4 dark:text-white text-gray-700">{channel.FacebookAds}</td>
                <td className="py-4 text-emerald-600 font-semibold">{channel.revenue}</td>
                <td className="py-4 dark:text-white text-gray-700">{channel.sales}</td>
                <td className="py-4 dark:text-white text-gray-700">{channel.conversion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Featured Campaigns */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold dark:text-white mb-4">Featured Campaigns</h2>
        {featuredCampaigns.map((item, i) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-3 py-3 items-center text-sm border-b dark:text-white text-gray-700">
            <span className="font-medium">{item.title}</span>
            <span className="hidden sm:block text-center"><span className={`px-2 py-1 rounded-md text-xs font-medium ${item.color}`}>{item.status}</span></span>
            <span className="text-right sm:text-left">{item.conversion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
