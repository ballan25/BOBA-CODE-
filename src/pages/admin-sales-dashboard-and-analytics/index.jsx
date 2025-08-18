// src/pages/admin-sales-dashboard-and-analytics/index.jsx
import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { 
  useDashboardKPIs, 
  useAnalytics, 
  useRealtimeTransactions,
  useSalesReport,
  useSavedReports
} from '../../hooks/useDatabase';

// Import existing components (keep your current ones)
import KPIWidgets from './components/KPIWidgets';
import SalesCharts from './components/SalesCharts';
import TransactionFeed from './components/TransactionFeed';
import DateRangeSelector from './components/DateRangeSelector';
import ExportModal from './components/ExportModal';
import SavedReports from './components/SavedReports';
import QuickActions from './components/QuickActions';
import DataTable from './components/DataTable';
import ProductPerformance from './components/ProductPerformance';
import PeakHourAnalysis from './components/PeakHourAnalysis';
import CashierFilters from './components/CashierFilters';
import AlertSystem from './components/AlertSystem';
import IntegrationStatus from './components/IntegrationStatus';

const AdminSalesDashboard = () => {
  // State for date range
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });

  // State for filters
  const [filters, setFilters] = useState({
    cashierId: null,
    paymentMethod: null,
    productCategory: null
  });

  // State for UI
  const [activeView, setActiveView] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  // Custom hooks for data
  const { kpis, loading: kpisLoading, error: kpisError, refetch: refetchKPIs } = useDashboardKPIs();
  const { 
    analytics, 
    loading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useAnalytics(dateRange.startDate, dateRange.endDate);
  
  const { 
    transactions: liveTransactions, 
    loading: transactionsLoading 
  } = useRealtimeTransactions({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    ...filters
  });

  const {
    report,
    loading: reportLoading,
    generateReport,
    clearReport
  } = useSalesReport();

  const {
    reports: savedReports,
    loading: savedReportsLoading,
    saveReport,
    deleteReport
  } = useSavedReports();

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    clearReport();
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Generate and export report
  const handleExportReport = async (exportType, customFilters = {}) => {
    try {
      const reportData = await generateReport(
        format(dateRange.startDate, 'yyyy-MM-dd'),
        format(dateRange.endDate, 'yyyy-MM-dd'),
        { ...filters, ...customFilters }
      );

      if (exportType === 'pdf') {
        // Generate PDF
        await generatePDFReport(reportData);
      } else if (exportType === 'csv') {
        // Generate CSV
        await generateCSVReport(reportData);
      } else if (exportType === 'save') {
        // Save to database
        await saveReport({
          name: `Sales Report ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
          type: 'sales',
          dateRange: {
            startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
            endDate: format(dateRange.endDate, 'yyyy-MM-dd')
          },
          filters,
          data: reportData,
          summary: reportData.summary
        });
      }

      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  };

  // Generate PDF report
  const generatePDFReport = async (reportData) => {
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BOBA CAFÉ - Sales Report</h1>
            <p>Period: ${reportData.period.startDate} to ${reportData.period.endDate}</p>
            <p>Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Sales</h3>
              <p style="font-size: 24px; font-weight: bold;">$${reportData.summary.totalSales.toFixed(2)}</p>
            </div>
            <div class="summary-card">
              <h3>Total Transactions</h3>
              <p style="font-size: 24px; font-weight: bold;">${reportData.summary.totalTransactions}</p>
            </div>
            <div class="summary-card">
              <h3>Average Order Value</h3>
              <p style="font-size: 24px; font-weight: bold;">$${reportData.summary.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>

          <h2>Payment Methods</h2>
          <table>
            <thead>
              <tr><th>Payment Method</th><th>Amount</th><th>Percentage</th></tr>
            </thead>
            <tbody>
              ${Object.entries(reportData.paymentMethodBreakdown).map(([method, amount]) => `
                <tr>
                  <td>${method.toUpperCase()}</td>
                  <td>$${amount.toFixed(2)}</td>
                  <td>${((amount / reportData.summary.totalSales) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="page-break"></div>
          
          <h2>Top Products</h2>
          <table>
            <thead>
              <tr><th>Product</th><th>Quantity Sold</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              ${reportData.topProducts.slice(0, 10).map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                  <td>$${product.revenue.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Generate CSV report
  const generateCSVReport = (reportData) => {
    const csvContent = [
      ['Sales Report - Transaction Details'],
      [`Period: ${reportData.period.startDate} to ${reportData.period.endDate}`],
      [''],
      ['Receipt Number', 'Date', 'Time', 'Items', 'Payment Method', 'Total'],
      ...reportData.transactions.map(t => [
        t.receiptNumber || t.id,
        format(new Date(t.createdAt?.toDate?.() || t.createdAt), 'yyyy-MM-dd'),
        format(new Date(t.createdAt?.toDate?.() || t.createdAt), 'HH:mm:ss'),
        t.items.map(item => `${item.quantity}x ${item.name}`).join('; '),
        t.paymentMethod.toUpperCase(),
        `$${t.total.toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Refresh all data
  const refreshAllData = () => {
    refetchKPIs();
    refetchAnalytics();
  };

  if (kpisLoading || analyticsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600">Monitor your business performance in real-time</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshAllData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Data
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AlertSystem />

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'transactions', label: 'Transactions' },
          { key: 'products', label: 'Products' },
          { key: 'reports', label: 'Reports' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeView === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Range and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <DateRangeSelector
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={handleDateRangeChange}
        />
        <CashierFilters
          selectedCashier={filters.cashierId}
          onCashierChange={(cashierId) => handleFilterChange('cashierId', cashierId)}
        />
        <select
          value={filters.paymentMethod || ''}
          onChange={(e) => handleFilterChange('paymentMethod', e.target.value || null)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">All Payment Methods</option>
          <option value="cash">Cash</option>
          <option value="mpesa">M-Pesa</option>
          <option value="card">Card</option>
        </select>
        <IntegrationStatus />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {activeView === 'overview' && (
          <>
            <KPIWidgets kpis={kpis} loading={kpisLoading} error={kpisError} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesCharts analytics={analytics} loading={analyticsLoading} />
              <TransactionFeed 
                transactions={liveTransactions.slice(0, 10)} 
                loading={transactionsLoading} 
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductPerformance dateRange={dateRange} />
              <PeakHourAnalysis analytics={analytics} />
            </div>
          </>
        )}

        {activeView === 'transactions' && (
          <DataTable 
            transactions={liveTransactions}
            loading={transactionsLoading}
            onSelectionChange={setSelectedTransactions}
          />
        )}

        {activeView === 'products' && (
          <ProductPerformance dateRange={dateRange} detailed={true} />
        )}

        {activeView === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SavedReports 
              reports={savedReports}
              loading={savedReportsLoading}
              onDelete={deleteReport}
            />
            <QuickActions 
              onGenerateReport={handleExportReport}
              loading={reportLoading}
            />
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExportReport}
          dateRange={dateRange}
          filters={filters}
          selectedTransactions={selectedTransactions}
        />
      )}
    </div>
  );
};

export default AdminSalesDashboard;
