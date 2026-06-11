'use client';

import KPIStatCard from '../components/KpiStatCards';
import { Eye, DollarSign, Package, Users, BarChart3 } from 'lucide-react';
import PaymentsOverview from '../components/PaymentsOverview';
import ProfitThisWeek from '../components/ProfitthisWeek';
import UsedDevices from '../components/Useddevices';
import USRegionMap from '../components/RegionLabels';
import TopChannelsAndChats from '../components/TopChannels';

const iconsMap = {
  BarChart3,
  Users,
  DollarSign,
} as const;

type IconKeys = keyof typeof iconsMap;



export default function DashboardPage() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen w-full overflow-x-hidden">
      <div className="pt-6 px-4 sm:px-6 w-full mx-auto">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIStatCard
            icon={<Eye className="w-7 h-7" />}
            value="3.5K"
            label="Total Views"
            change={0.43}
            iconBg="bg-green-500"
          />
          <KPIStatCard
            icon={<DollarSign className="w-7 h-7" />}
            value="$4.2K"
            label="Total Profit"
            change={4.35}
            iconBg="bg-orange-400"
          />
          <KPIStatCard
            icon={<Package className="w-7 h-7" />}
            value="3.5K"
            label="Total Products"
            change={2.59}
            iconBg="bg-violet-500"
          />
          <KPIStatCard
            icon={<Users className="w-7 h-7" />}
            value="3.5K"
            label="Total Users"
            change={-0.95}
            iconBg="bg-sky-500"
          />
        </div>

        <div className="py-6 flex flex-col justify-between md:flex-row gap-6 w-full">
          <PaymentsOverview />
          <ProfitThisWeek />
        </div>

        <div className="flex flex-col md:flex-row gap-4 my-4 w-full">
          <div className="w-full overflow-x-auto">
            <UsedDevices />
          </div>
          <div className="w-full overflow-x-auto">
            <USRegionMap />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <TopChannelsAndChats />
        </div>
      </div>
    </div>
  );
}
