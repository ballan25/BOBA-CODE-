// src/hooks/useDatabase.js
import { useState, useEffect, useCallback } from 'react';
import { 
  TransactionService, 
  ProductService, 
  AnalyticsService, 
  ReportService,
  checkDatabaseHealth
} from '../services/database';

// ============ TRANSACTION HOOKS ============

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await TransactionService.getTransactions(filters);
      setTransactions(result.transactions);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (transactionData) => {
    try {
      const newTransaction = await TransactionService.createTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    hasMore,
    createTransaction,
    refetch: fetchTransactions
  };
}

// Real-time transactions hook
export function useRealtimeTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = TransactionService.subscribeToTransactions(
      (newTransactions) => {
        setTransactions(newTransactions);
        setLoading(false);
      },
      filters
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [filters]);

  return { transactions, loading, error };
}

// ============ PRODUCT HOOKS ============

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ProductService.getProducts(filters);
      setProducts(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (productData) => {
    try {
      const newProduct = await ProductService.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      await ProductService.updateProduct(id, updates);
      setProducts(prev => 
        prev.map(product => 
          product.id === id 
            ? { ...product, ...updates, updatedAt: new Date() }
            : product
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateStock = async (productId, quantity, operation = 'decrement') => {
    try {
      await ProductService.updateStock(productId, quantity, operation);
      setProducts(prev => 
        prev.map(product => {
          if (product.id === productId) {
            const stockChange = operation === 'increment' ? quantity : -quantity;
            return { 
              ...product, 
              stock: Math.max(0, product.stock + stockChange),
              updatedAt: new Date()
            };
          }
          return product;
        })
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    updateStock,
    refetch: fetchProducts
  };
}

// ============ ANALYTICS HOOKS ============

export function useAnalytics(startDate, endDate) {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AnalyticsService.getAnalytics(startDate, endDate);
      setAnalytics(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [fetchAnalytics, startDate, endDate]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

// Dashboard KPIs hook
export function useDashboardKPIs() {
  const [kpis, setKpis] = useState({
    todaySales: 0,
    yesterdaySales: 0,
    monthSales: 0,
    monthTransactions: 0,
    salesGrowth: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AnalyticsService.getDashboardKPIs();
      setKpis(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
    
    // Refresh KPIs every 5 minutes
    const interval = setInterval(fetchKPIs, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchKPIs]);

  return { kpis, loading, error, refetch: fetchKPIs };
}

// ============ REPORTS HOOKS ============

export function useSavedReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ReportService.getSavedReports();
      setReports(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const saveReport = async (reportData) => {
    try {
      const newReport = await ReportService.saveReport(reportData);
      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteReport = async (reportId) => {
    try {
      await ReportService.deleteReport(reportId);
      setReports(prev => prev.filter(report => report.id !== reportId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    reports,
    loading,
    error,
    saveReport,
    deleteReport,
    refetch: fetchReports
  };
}

// Generate sales report hook
export function useSalesReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (startDate, endDate, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ReportService.generateSalesReport(startDate, endDate, filters);
      setReport(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error generating report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearReport = () => {
    setReport(null);
    setError(null);
  };

  return {
    report,
    loading,
    error,
    generateReport,
    clearReport
  };
}

// ============ UTILITY HOOKS ============

// Database connection status hook
export function useDatabaseStatus() {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      const result = await checkDatabaseHealth();
      setStatus(result.status);
      setLastCheck(result.timestamp);
    } catch (err) {
      setStatus('error');
      setLastCheck(new Date());
      console.error('Database status check failed:', err);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { status, lastCheck, checkStatus };
}

// Generic loading state hook for database operations
export function useAsyncOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (asyncFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Async operation failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
}
