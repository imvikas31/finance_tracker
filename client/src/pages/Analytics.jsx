import { useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatCurrency';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6','#84cc16','#a855f7'];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Analytics = () => {
  const { summary, fetchSummary } = useFinance();
  useEffect(() => { fetchSummary(); }, []);

  const catData = summary?.categoryBreakdown || [];
  const trendRaw = summary?.monthlyTrend || [];
  const month = summary?.currentMonth;

  // Build trend maps
  const trendMap = {};
  trendRaw.forEach(({ _id, total }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2,'0')}`;
    if (!trendMap[key]) trendMap[key] = { label: months[_id.month - 1], income: 0, expense: 0 };
    trendMap[key][_id.type] = total;
  });
  const trendEntries = Object.values(trendMap);

  const doughnutData = {
    labels: catData.map((c) => c._id),
    datasets: [{ data: catData.map((c) => c.total), backgroundColor: COLORS, borderWidth: 0 }],
  };

  const barData = {
    labels: trendEntries.map((v) => v.label),
    datasets: [
      { label: 'Income', data: trendEntries.map((v) => v.income), backgroundColor: '#10b981', borderRadius: 6 },
      { label: 'Expenses', data: trendEntries.map((v) => v.expense), backgroundColor: '#ef4444', borderRadius: 6 },
    ],
  };

  const lineData = {
    labels: trendEntries.map((v) => v.label),
    datasets: [{
      label: 'Net Savings',
      data: trendEntries.map((v) => v.income - v.expense),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } },
  };

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Monthly Income', value: formatCurrency(month?.income), color: 'text-emerald-600' },
          { label: 'Monthly Expenses', value: formatCurrency(month?.expenses), color: 'text-red-500' },
          { label: 'Savings Rate', value: `${(month?.savingsRate || 0).toFixed(1)}%`, color: 'text-primary-600' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Income vs Expenses</h3>
          {trendEntries.length > 0
            ? <Bar data={barData} options={chartOptions} />
            : <EmptyChart />}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Net Savings Trend</h3>
          {trendEntries.length > 0
            ? <Line data={lineData} options={chartOptions} />
            : <EmptyChart />}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Spending Breakdown</h3>
          {catData.length > 0
            ? <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'right' } }, cutout: '60%' }} />
            : <EmptyChart />}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Expense Categories</h3>
          {catData.length === 0 ? <EmptyChart /> : (
            <div className="space-y-3">
              {catData.slice(0, 6).map((c, i) => {
                const pct = month?.expenses > 0 ? (c.total / month.expenses) * 100 : 0;
                return (
                  <div key={c._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{c._id}</span>
                      <span className="font-mono font-medium text-slate-800">{formatCurrency(c.total)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{pct.toFixed(1)}% of expenses</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyChart = () => (
  <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
    No data to display yet
  </div>
);

export default Analytics;
