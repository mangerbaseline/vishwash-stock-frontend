'use client';
import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const data_month = [
  { month: 'Jan', received: 10, due: 15 },
  { month: 'Feb', received: 20, due: 25 },
  { month: 'Mar', received: 35, due: 30 },
  { month: 'Apr', received: 45, due: 35 },
  { month: 'May', received: 30, due: 50 },
  { month: 'Jun', received: 70, due: 60 },
  { month: 'Jul', received: 60, due: 65 },
  { month: 'Aug', received: 80, due: 75 },
  { month: 'Sep', received: 90, due: 85 },
  { month: 'Oct', received: 85, due: 75 },
  { month: 'Nov', received: 70, due: 60 },
  { month: 'Dec', received: 75, due: 80 },
];

const data_year = [
  { month: '2020', received: 450, due: 1480 },
  { month: '2021', received: 620, due: 1720 },
  { month: '2022', received: 780, due: 1950 },
  { month: '2023', received: 920, due: 2300 },
  { month: '2024', received: 1080, due: 1200 },
];

export default function PaymentsOverview() {
  const [selectedRange, setSelectedRange] = useState<'Monthly' | 'Yearly'>('Monthly');
  const chartData = selectedRange === 'Monthly' ? data_month : data_year;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-[590px] w-full p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Payments Overview</h2>
        <select
          className="text-sm border rounded-md px-2 py-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          onChange={(e) => setSelectedRange(e.target.value as 'Monthly' | 'Yearly')}
        >
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderColor: '#ccc' }}
              labelStyle={{ color: '#333' }}
              itemStyle={{ color: '#333' }}
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Line type="monotone" dataKey="received" stroke="#6366f1" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="due" stroke="#06b6d4" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Section */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between text-sm gap-y-4 gap-x-6 text-center">
        <div className="flex-1 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 pb-4 sm:pb-0 sm:pr-4">
          <p className="text-gray-500 dark:text-gray-400 text-base">Received Amount</p>
          <p className="font-bold text-xl text-gray-800 dark:text-white">$580.00</p>
        </div>
        <div className="flex-1 sm:pl-4">
          <p className="text-gray-500 dark:text-gray-400 text-base">Due Amount</p>
          <p className="font-bold text-xl text-gray-800 dark:text-white">$628.00</p>
        </div>
      </div>
    </div>
  );
}
