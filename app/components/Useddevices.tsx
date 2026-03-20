'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Desktop', value: 65 },
  { name: 'Mobile', value: 20 },
  { name: 'Tablet', value: 10 },
  { name: 'Unknown', value: 5 },
];

const COLORS = ['#0e14cd', '#3035d3', '#474bcb', '#6f71bb'];

export default function UsedDevices() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-[590px] m-auto shadow-sm w-full text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Used Devices</h2>
        <select className="text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md px-2 py-1">
          <option>Monthly</option>
          <option>Weekly</option>
        </select>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Visitors</p>
          <p className="text-2xl font-bold">2500</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              ></span>
              {item.name} {item.value}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
