import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import KPIWidgets from './components/KPIWidgets';
import DateRangeSelector from './components/DateRangeSelector';
import CashierFilters from './components/CashierFilters';
import SavedReports from './components/SavedReports';
import SalesCharts from './components/SalesCharts';
import ProductPerformance from './components/ProductPerformance';
import PeakHourAnalysis from './components/PeakHourAnalysis';
import TransactionFeed from './components/TransactionFeed';
import QuickActions from './components/QuickActions';
import DataTable from './components/DataTable';
import IntegrationStatus from './components/IntegrationStatus';
import AlertSystem from './components/AlertSystem';
import ExportModal from './components/ExportModal';

const AdminSalesDashboardAndAnalytics = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    endDate: new Date()
  });
  const [selectedCashiers, setSelectedCashiers] = useState([]);
  const [selectedChartView, setSelectedChartView] = useState('daily'); // daily, weekly, monthly
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [firestoreStatus, setFirestoreStatus] = useState('connected');
  const [mpesaApiStatus, setMpesaApiStatus] = useState('connected');

  // Mock user data - in real app, this would come from authentication context
  useEffect(() => {
    const mockUser = {
      id: 'user_001',
      name: 'Admin Manager',
      email: 'admin@bobacafe.com',
      role: 'manager'
    };
    setUser(mockUser);
  }, []);

  // Mock data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockData = {
        kpi: {
          dailyRevenue: 45250.75,
          dailyRevenueChange: 12.5,
          transactionCount: 187,
          transactionCountChange: -3.2,
          averageOrderValue: 242.25,
          averageOrderValueChange: 8.1,
          mpesaRatio: 68.5,
          mpesaRatioChange: 5.2,
          cashRatio: 31.5
        },
        salesData: [
          { date: '2025-01-01', revenue: 42500, transactions: 175, mpesa: 28900, cash: 13600 },
          { date: '2025-01-02', revenue: 38750, transactions: 162, mpesa: 26125, cash: 12625 },
          { date: '2025-01-03', revenue: 46200, transactions: 195, mpesa: 31416, cash: 14784 },
          { date: '2025-01-04', revenue: 41850, transactions: 178, mpesa: 28458, cash: 13392 },
          { date: '2025-01-05', revenue: 44300, transactions: 185, mpesa: 30365, cash: 13935 },
          { date: '2025-01-06', revenue: 47800, transactions: 198, mpesa: 32744, cash: 15056 },
          { date: '2025-01-07', revenue: 45250, transactions: 187, mpesa: 31001, cash: 14249 }
        ],
        productPerformance: [
          { name: 'Classic Milk Tea', revenue: 8950, quantity: 142, growth: 15.2 },
          { name: 'Taro Smoothie', revenue: 6720, quantity: 96, growth: -2.1 },
          { name: 'Brown Sugar Boba', revenue: 7840, quantity: 128, growth: 22.8 },
          { name: 'Thai Tea Latte', revenue: 5670, quantity: 81, growth: 8.9 },
          { name: 'Matcha Frappuccino', revenue: 4560, quantity: 64, growth: -5.4 }
        ],
        peakHours: [
          { hour: '08:00', transactions: 15, revenue: 3450 },
          { hour: '09:00', transactions: 18, revenue: 4280 },
          { hour: '10:00', transactions: 22, revenue: 5120 },
          { hour: '11:00', transactions: 28, revenue: 6450 },
          { hour: '12:00', transactions: 35, revenue: 8250 },
          { hour: '13:00', transactions: 32, revenue: 7680 },
          { hour: '14:00', transactions: 25, revenue: 6100 },
          { hour: '15:00', transactions: 20, revenue: 4850 },
          { hour: '16:00', transactions: 18, revenue: 4320 },
          { hour: '17:00', transactions: 16, revenue: 3920 }
        ],
        recentTransactions: [
          {
            id: 'TXN001',
            timestamp: new Date(Date.now() - 300000)?.toISOString(),
            amount: 680,
            method: 'M-Pesa',
            cashier: 'Sarah Johnson',
            items: ['Classic Milk Tea (L)', 'Tapioca Pearls'],
            status: 'completed'
          },
          {
            id: 'TXN002',
            timestamp: new Date(Date.now() - 600000)?.toISOString(),
            amount: 420,
            method: 'Cash',
            cashier: 'Mike Chen',
            items: ['Taro Smoothie (M)'],
            status: 'completed'
          },
          {
            id: 'TXN003',
            timestamp: new Date(Date.now() - 900000)?.toISOString(),
            amount: 850,
            method: 'M-Pesa',
            cashier: 'Sarah Johnson',
            items: ['Brown Sugar Boba (L)', 'Chicken Wings'],
            status: 'completed'
          }
        ],
        cashierPerformance: [
          { 
            id: 'cashier_001', 
            name: 'Sarah Johnson', 
            transactions: 95, 
            revenue: 22750, 
            efficiency: 92.5,
            shift: 'Morning'
          },
          { 
            id: 'cashier_002', 
            name: 'Mike Chen', 
            transactions: 78, 
            revenue: 18420, 
            efficiency: 88.2,
            shift: 'Afternoon'
          },
          { 
            id: 'cashier_003', 
            name: 'Lisa Wong', 
            transactions: 14, 
            revenue: 4080, 
            efficiency: 86.7,
            shift: 'Evening'
          }
        ]
      };

      setDashboardData(mockData);

      // Mock alerts
      setAlerts([
        {
          id: 'alert_001',
          type: 'warning',
          title: 'Inventory Low',
          message: 'Tapioca pearls running low (12 units remaining)',
          timestamp: new Date(Date.now() - 1800000)?.toISOString(),
          priority: 'medium'
        },
        {
          id: 'alert_002',
          type: 'info',
          title: 'Daily Target Reached',
          message: 'Sales target of KES 40,000 achieved at 2:30 PM',
          timestamp: new Date(Date.now() - 3600000)?.toISOString(),
          priority: 'low'
        }
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, [dateRange, selectedCashiers]);

  const handleLogout = () => {
    setUser(null);
    navigate('/staff-login-and-authentication');
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const handleCashierFilterChange = (cashierIds) => {
    setSelectedCashiers(cashierIds);
  };

  const handleChartViewChange = (view) => {
    setSelectedChartView(view);
  };

  const handleExportData = (exportOptions) => {
    // Mock export functionality
    const exportData = {
      dateRange,
      data: dashboardData,
      options: exportOptions
    };
    
    console.log('Exporting data:', exportData);
    alert(`Export started: ${exportOptions?.format} format with ${exportOptions?.dataTypes?.join(', ')} data`);
    setShowExportModal(false);
  };

  const handleTransactionEdit = (transactionId, newData) => {
    // Mock transaction editing
    console.log('Editing transaction:', transactionId, newData);
    alert(`Transaction ${transactionId} updated successfully`);
  };

  const handleBulkOperation = (operation, selectedIds) => {
    // Mock bulk operations
    console.log('Bulk operation:', operation, selectedIds);
    alert(`Bulk ${operation} completed for ${selectedIds?.length} items`);
  };

  const filteredData = useMemo(() => {
    if (!dashboardData) return null;

    let filtered = { ...dashboardData };

    // Filter by cashier if selected
    if (selectedCashiers?.length > 0) {
      filtered.recentTransactions = dashboardData?.recentTransactions?.filter(
        transaction => selectedCashiers?.includes(transaction?.cashier)
      );
      
      filtered.cashierPerformance = dashboardData?.cashierPerformance?.filter(
        cashier => selectedCashiers?.includes(cashier?.name)
      );
    }

    return filtered;
  }, [dashboardData, selectedCashiers]);

  // Role-based access control
  const hasManagerAccess = user?.role === 'manager';
  const hasCashierAccess = user?.role === 'cashier';

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Restrict access for non-managers
  if (!hasManagerAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={handleLogout} />
        <div className="pt-16 flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Icon name="Shield" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              This dashboard is only available to store managers.
            </p>
            <Button onClick={() => navigate('/point-of-sale-order-processing')}>
              Go to POS System
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={handleLogout} />
        <div className="pt-16 flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Sales Dashboard & Analytics
              </h1>
              <p className="text-muted-foreground">
                Comprehensive sales oversight and operational control
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <IntegrationStatus 
                firestoreStatus={firestoreStatus}
                mpesaApiStatus={mpesaApiStatus}
              />
              <Button
                onClick={() => setShowExportModal(true)}
                variant="outline"
                iconName="Download"
                iconPosition="left"
                className="touch-feedback"
              >
                Export Data
              </Button>
            </div>
          </div>

          {/* Alert System */}
          <AlertSystem alerts={alerts} onDismiss={(id) => setAlerts(alerts?.filter(a => a?.id !== id))} />

          {/* KPI Widgets */}
          <KPIWidgets data={filteredData?.kpi} />

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-12 gap-6 mt-6">
            {/* Left Panel - Filters & Controls (25%) */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <DateRangeSelector 
                dateRange={dateRange}
                onChange={handleDateRangeChange}
              />
              
              <CashierFilters 
                cashiers={dashboardData?.cashierPerformance || []}
                selectedCashiers={selectedCashiers}
                onChange={handleCashierFilterChange}
              />
              
              <SavedReports />
            </div>

            {/* Center Panel - Charts & Analytics (50%) */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <SalesCharts 
                data={filteredData?.salesData || []}
                viewType={selectedChartView}
                onViewChange={handleChartViewChange}
              />
              
              <ProductPerformance 
                data={filteredData?.productPerformance || []}
              />
              
              <PeakHourAnalysis 
                data={filteredData?.peakHours || []}
              />
            </div>

            {/* Right Panel - Live Data & Actions (25%) */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <TransactionFeed 
                transactions={filteredData?.recentTransactions || []}
              />
              
              <QuickActions 
                onExport={() => setShowExportModal(true)}
                onRefresh={() => window.location?.reload()}
                user={user}
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="mt-8">
            <DataTable 
              data={filteredData?.recentTransactions || []}
              onEdit={handleTransactionEdit}
              onBulkOperation={handleBulkOperation}
              user={user}
            />
          </div>
        </div>
      </div>
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportData}
        dateRange={dateRange}
      />
    </div>
  );
};

export default AdminSalesDashboardAndAnalytics;
