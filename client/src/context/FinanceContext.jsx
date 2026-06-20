import { createContext, useContext, useState, useCallback } from 'react';
import { transactionAPI } from '../api/axiosInstance';
import toast from 'react-hot-toast';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await transactionAPI.getAll(params);
      setTransactions(data.data);
      setPagination({
        total: data.total,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (params = {}) => {
    try {
      const { data } = await transactionAPI.getSummary(params);
      setSummary(data.data);
    } catch (err) {
      toast.error('Failed to fetch summary');
    }
  }, []);

  const addTransaction = async (formData) => {
    const { data } = await transactionAPI.create(formData);
    setTransactions((prev) => [data.data, ...prev]);
    toast.success('Transaction added');
    return data.data;
  };

  const editTransaction = async (id, formData) => {
    const { data } = await transactionAPI.update(id, formData);
    setTransactions((prev) =>
      prev.map((t) => (t._id === id ? data.data : t))
    );
    toast.success('Transaction updated');
    return data.data;
  };

  const removeTransaction = async (id) => {
    await transactionAPI.remove(id);
    setTransactions((prev) => prev.filter((t) => t._id !== id));
    toast.success('Transaction deleted');
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions, summary, pagination, loading,
        fetchTransactions, fetchSummary,
        addTransaction, editTransaction, removeTransaction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be inside FinanceProvider');
  return ctx;
};
