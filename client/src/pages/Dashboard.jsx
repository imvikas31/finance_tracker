import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/ui/TransactionForm';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

const Dashboard = () => {
  const { user } = useAuth();
  const { summary, transactions, fetchSummary, fetchTransactions, loading } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchSummary();
    fetchTransactions({ limit: 5, sort: '-date' });
  }, []);

  const month = summary?.currentMonth;

  const doughnutData = {
    labels: summary?.categoryBreakdown?.map((c) => c._id) || [],
    datasets: [{
      data: summary?.categoryBreakdown?.map((c) => c.total) || [],
      backgroundColor: CHART_COLORS,
      borderWidth: 0,
    }],
  };

  // Build 6-month bar chart data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendMap = {};
  (summary?.monthlyTrend || []).forEach(({ _id, total }) => {
    const key = `${_id.year}-${_id.month}`;
    if (!trendMap[key]) trendMap[key] = { month: months[_id.month - 1], income: 0, expense: 0 };
    trendMap[key][_id.type] = total;
  });
  const trendLabels = Object.values(trendMap).map((v) => v.month);
  const barData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Income',
        data: Object.values(trendMap).map((v) => v.income),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: Object.values(trendMap).map((v) => v.expense),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Here's your financial overview for this month</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(month?.income)}
          subtitle="This month"
          icon={TrendingUp}
          color="income"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(month?.expenses)}
          subtitle="This month"
          icon={TrendingDown}
          color="expense"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(month?.savings)}
          subtitle="Income − Expenses"
          icon={PiggyBank}
          color="savings"
        />
        <StatCard
          title="Savings Rate"
          value={`${(month?.savingsRate || 0).toFixed(1)}%`}
          subtitle="Of income saved"
          icon={DollarSign}
          color="primary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart */}
        <div className="card lg:col-span-3">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Income vs Expenses (6 months)</h3>
          {trendLabels.length > 0 ? (
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } },
              }}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Doughnut */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Spending by Category</h3>
          {summary?.categoryBreakdown?.length > 0 ? (
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
                cutout: '65%',
              }}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No expenses yet</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Recent Transactions</h3>
          <a href="/transactions" className="text-xs text-primary-600 hover:underline">View all</a>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">No transactions yet. Add your first one!</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div key={t._id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base
                  ${t.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  {t.type === 'income' ? '💰' : '💸'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{t.category}</p>
                  <p className="text-xs text-slate-400">{t.description || t.paymentMethod} · {new Date(t.date).toLocaleDateString('en-IN')}</p>
                </div>
                <p className={`text-sm font-semibold font-mono ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Transaction">
        <TransactionForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;
