import { useState, useEffect } from 'react';
import { Target, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatCurrency';

const Budget = () => {
  const { user, updateProfile } = useAuth();
  const { summary, fetchSummary } = useFinance();
  const [budget, setBudget] = useState(user?.monthlyBudget || 0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSummary(); }, []);
  useEffect(() => { setBudget(user?.monthlyBudget || 0); }, [user]);

  const expenses = summary?.currentMonth?.expenses || 0;
  const remaining = budget - expenses;
  const usedPct = budget > 0 ? Math.min((expenses / budget) * 100, 100) : 0;
  const isOverBudget = remaining < 0;

  const saveBudget = async () => {
    setSaving(true);
    try {
      await updateProfile({ monthlyBudget: Number(budget) });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const catData = summary?.categoryBreakdown || [];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Budget setup */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-slate-800">Monthly Budget</h3>
        </div>

        {editing ? (
          <div className="flex gap-3">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="input-field font-mono text-lg"
              placeholder="Enter monthly budget"
              min="0"
            />
            <button onClick={saveBudget} disabled={saving} className="btn-primary whitespace-nowrap">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold font-mono text-slate-800">{formatCurrency(budget)}</p>
              <p className="text-sm text-slate-400 mt-1">Budget set for this month</p>
            </div>
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              {budget > 0 ? 'Update' : 'Set Budget'}
            </button>
          </div>
        )}

        {budget > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Spent: <span className="font-mono font-medium text-slate-800">{formatCurrency(expenses)}</span></span>
              <span className={`font-mono font-medium ${isOverBudget ? 'text-red-500' : 'text-emerald-600'}`}>
                {isOverBudget ? `Over by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} left`}
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usedPct > 90 ? 'bg-red-500' : usedPct > 70 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{usedPct.toFixed(1)}% of budget used</p>
          </div>
        )}
      </div>

      {/* Status card */}
      {budget > 0 && (
        <div className={`card border-l-4 ${isOverBudget ? 'border-l-red-500 bg-red-50' : 'border-l-emerald-500 bg-emerald-50'}`}>
          <div className="flex items-center gap-2">
            <TrendingDown className={`w-5 h-5 ${isOverBudget ? 'text-red-500' : 'text-emerald-600'}`} />
            <p className={`text-sm font-medium ${isOverBudget ? 'text-red-700' : 'text-emerald-700'}`}>
              {isOverBudget
                ? `You've exceeded your monthly budget by ${formatCurrency(Math.abs(remaining))}. Consider cutting back on non-essential spending.`
                : `You're on track! ${formatCurrency(remaining)} remaining for this month.`}
            </p>
          </div>
        </div>
      )}

      {/* Per-category breakdown */}
      {catData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {catData.map((c, i) => (
              <div key={c._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-600">{c._id}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{c.count} transactions</span>
                  <span className="font-mono text-sm font-semibold text-red-500">
                    {formatCurrency(c.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
