'use client';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data_this_week = [
  { day: 'Sat', sales: 45, revenue: 15 },
  { day: 'Sun', sales: 60, revenue: 20 },
  { day: 'Mon', sales: 50, revenue: 15 },
  { day: 'Tue', sales: 70, revenue: 10 },
  { day: 'Wed', sales: 30, revenue: 10 },
  { day: 'Thu', sales: 60, revenue: 15 },
  { day: 'Fri', sales: 70, revenue: 10 },
];

const data_last_week = [
  { day: 'Sat', sales: 35, revenue: 40 },
  { day: 'Sun', sales: 25, revenue: 60 },
  { day: 'Mon', sales: 40, revenue: 75 },
  { day: 'Tue', sales: 60, revenue: 30 },
  { day: 'Wed', sales: 20, revenue: 65 },
  { day: 'Thu', sales: 55, revenue: 45 },
  { day: 'Fri', sales: 35, revenue: 50 },
];

export default function ProfitThisWeek() {
  const [selected, setSelected] = useState<'This Week' | 'Last Week'>('This Week');

  const chartData = selected === 'This Week' ? data_this_week : data_last_week;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm w-full max-w-[588px] md:max-w-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Profit this week</h2>
        <select
          className="text-sm border rounded-md px-2 py-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          onChange={(e) => setSelected(e.target.value as 'This Week' | 'Last Week')}
        >
          <option>This Week</option>
          <option>Last Week</option>
        </select>
      </div>

      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="day" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderColor: '#ccc' }}
              labelStyle={{ color: '#333' }}
              itemStyle={{ color: '#333' }}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="revenue" stackId="a" fill="#06b6d4" barSize={11} />
            <Bar dataKey="sales" stackId="a" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
