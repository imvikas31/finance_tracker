import { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';

const CATEGORIES = {
  expense: [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Health & Medical', 'Housing & Rent', 'Utilities', 'Education',
    'Travel', 'Personal Care', 'Insurance', 'Other Expense',
  ],
  income: [
    'Salary', 'Freelance', 'Business', 'Investment Returns',
    'Rental Income', 'Gift', 'Bonus', 'Other Income',
  ],
};

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'];

const defaultForm = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'UPI',
};

const TransactionForm = ({ transaction, onClose }) => {
  const { addTransaction, editTransaction, fetchSummary } = useFinance();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
        paymentMethod: transaction.paymentMethod || 'Cash',
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Reset category when type changes
      ...(name === 'type' && { category: '' }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;
    setLoading(true);
    try {
      if (transaction) {
        await editTransaction(transaction._id, form);
      } else {
        await addTransaction(form);
      }
      await fetchSummary();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = CATEGORIES[form.type] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm((p) => ({ ...p, type: t, category: '' }))}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize ${
              form.type === t
                ? t === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-emerald-500 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="input-field font-mono text-lg"
          placeholder="0.00"
          min="0.01"
          step="0.01"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input-field"
          placeholder="Optional note..."
          maxLength={200}
        />
      </div>

      {/* Date & Payment Method */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="input-field">
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : transaction ? 'Update' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
