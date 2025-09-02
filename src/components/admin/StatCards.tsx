import Link from 'next/link';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  href: string;
  color: string;
}

export default function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Link href={stat.href} key={stat.label} className="group">
          <div className="p-6 rounded-xl shadow bg-white group-hover:shadow-lg transition flex flex-col items-start">
            <div className={`text-3xl mb-3 rounded-full p-3 ${stat.color}`}>{stat.icon}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            <div className="text-2xl font-bold mt-1 mb-1">{stat.value}</div>
            <div className="ml-auto text-xs text-amber-500 mt-2 group-hover:underline">View details</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
