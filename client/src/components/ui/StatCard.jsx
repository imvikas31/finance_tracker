const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    income: 'bg-emerald-50 text-emerald-600',
    expense: 'bg-red-50 text-red-600',
    savings: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 font-mono">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
