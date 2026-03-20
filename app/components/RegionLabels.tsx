'use client';

import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

export default function USRegionMap() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm w-full text-gray-900 dark:text-gray-100">
      <h2 className="text-lg font-semibold mb-4">Region labels</h2>

      <div className="w-full h-80">
        <ComposableMap projection="geoAlbersUsa" width={500} height={300}>
<Geographies geography={geoUrl}>
  {(result: { geographies: any[] }) =>
    result.geographies.map((geo) => (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        style={{
          default: {
            fill: 'var(--region-fill)',
            outline: 'none',
          },
          hover: {
            fill: 'var(--region-hover)',
            outline: 'none',
          },
          pressed: {
            fill: 'var(--region-pressed)',
            outline: 'none',
          },
        }}
      />
    ))
  }
</Geographies>

        </ComposableMap>
      </div>

      <style jsx global>{`
        :root {
          --region-fill: #e5e7eb;
          --region-hover: #cbd5e1;
          --region-pressed: #94a3b8;
        }

        .dark {
          --region-fill: #374151;
          --region-hover: #4b5563;
          --region-pressed: #6b7280;
        }
      `}</style>
    </div>
  );
}
