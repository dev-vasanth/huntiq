export default function StatsCard({ label, value, icon: Icon, color = 'text-violet-400', bg = 'bg-violet-500/10', change, suffix = '' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold ${color} mb-1`}>{value}{suffix}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}
