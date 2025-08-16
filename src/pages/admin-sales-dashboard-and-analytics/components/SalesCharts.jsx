import React from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SalesCharts = ({ data = [], viewType, onViewChange }) => {
  const viewOptions = [
    { key: 'daily', label: 'Daily', icon: 'Calendar' },
    { key: 'weekly', label: 'Weekly', icon: 'BarChart3' },
    { key: 'monthly', label: 'Monthly', icon: 'TrendingUp' }
  ];

  const formatXAxis = (tickItem) => {
    const date = parseISO(tickItem);
    switch (viewType) {
      case 'daily':
        return format(date, 'MMM dd');
      case 'weekly':
        return format(date, 'MMM dd');
      case 'monthly':
        return format(date, 'MMM');
      default:
        return format(date, 'MMM dd');
    }
  };

  const formatTooltipLabel = (label) => {
    const date = parseISO(label);
    return format(date, 'EEEE, MMMM dd, yyyy');
  };

  const formatCurrency = (value) => {
    return `KES ${value?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {formatTooltipLabel(label)}
          </p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-medium text-foreground">
                {entry?.name === 'Transactions' ? entry?.value : formatCurrency(entry?.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalRevenue = data?.reduce((sum, item) => sum + item?.revenue, 0);
  const totalTransactions = data?.reduce((sum, item) => sum + item?.transactions, 0);
  const averageOrder = totalRevenue / totalTransactions || 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="BarChart3" size={20} className="mr-2" />
            Sales Analytics
          </h3>
          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
            <span>Total: {formatCurrency(totalRevenue)}</span>
            <span>•</span>
            <span>{totalTransactions} transactions</span>
            <span>•</span>
            <span>Avg: {formatCurrency(averageOrder)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {viewOptions?.map((option) => (
            <Button
              key={option?.key}
              variant={viewType === option?.key ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange?.(option?.key)}
              iconName={option?.icon}
              iconPosition="left"
              iconSize={16}
              className="touch-feedback"
            >
              {option?.label}
            </Button>
          ))}
        </div>
      </div>
      {data?.length > 0 ? (
        <div className="space-y-6">
          {/* Revenue and Transactions Chart */}
          <div className="h-80">
            <h4 className="text-sm font-medium text-foreground mb-4">Revenue & Transaction Trends</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  yAxisId="revenue"
                  orientation="left"
                  tickFormatter={(value) => `KES ${(value / 1000)?.toFixed(0)}k`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  yAxisId="transactions"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue (KES)"
                />
                <Line
                  yAxisId="transactions"
                  type="monotone"
                  dataKey="transactions"
                  stroke="hsl(var(--accent-foreground))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent-foreground))", strokeWidth: 2, r: 4 }}
                  name="Transactions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Chart */}
          <div className="h-80">
            <h4 className="text-sm font-medium text-foreground mb-4">Payment Method Breakdown</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxis}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tickFormatter={(value) => `KES ${(value / 1000)?.toFixed(0)}k`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="mpesa"
                  stackId="payment"
                  fill="hsl(var(--primary))"
                  name="M-Pesa (KES)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="cash"
                  stackId="payment"
                  fill="hsl(var(--muted-foreground))"
                  name="Cash (KES)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Icon name="BarChart3" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No data available for the selected period</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCharts;