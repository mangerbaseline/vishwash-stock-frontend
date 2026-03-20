'use client';
import { ArrowUp, ArrowDown } from 'lucide-react';
import React from 'react';

interface KPIStatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  change: number;
  iconBg: string;
}

export default function KPIStatCard({
  icon,
  value,
  label,
  change,
  iconBg,
}: KPIStatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col justify-between p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm w-full min-w-[200px] h-full">
      <div className={`w-14 h-14 flex items-center justify-center rounded-full text-white ${iconBg}`}>
        {icon}
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-col justify-between mt-4 sm:mt-0 lg:mt-4">
        <div className="text-left">
          <div className="text-2xl text-[#111928] dark:text-white mb-1 font-bold">{value}</div>
          <div className="text-sm font-medium text-[#9CA3AF] dark:text-gray-400">{label}</div>
        </div>
        <div className={`mt-2 text-sm font-medium flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(change).toFixed(2)}%
          {isPositive ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />}
        </div>
      </div>
    </div>
  );
}
