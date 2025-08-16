import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PeakHourAnalysis = ({ data = [] }) => {
  const [viewMode, setViewMode] = useState('transactions'); // transactions, revenue
  const [chartType, setChartType] = useState('area'); // area, bar

  const viewOptions = [
    { key: 'transactions', label: 'Transactions', icon: 'ShoppingBag' },
    { key: 'revenue', label: 'Revenue', icon: 'DollarSign' }
  ];

  const chartOptions = [
    { key: 'area', label: 'Area', icon: 'Activity' },
    { key: 'bar', label: 'Bar', icon: 'BarChart3' }
  ];

  const formatValue = (value, type) => {
    switch (type) {
      case 'revenue':
        return `KES ${value?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
      case 'transactions':
        return `${value} txns`;
      default:
        return value;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {label}:00
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transactions:</span>
              <span className="font-medium">{data?.transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-medium">{formatValue(data?.revenue, 'revenue')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Order:</span>
              <span className="font-medium">
                KES {(data?.revenue / data?.transactions)?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find peak hours
  const peakHour = data?.reduce((max, hour) => 
    hour?.[viewMode] > max?.[viewMode] ? hour : max, data?.[0] || {});
    
  const totalTransactions = data?.reduce((sum, hour) => sum + hour?.transactions, 0);
  const totalRevenue = data?.reduce((sum, hour) => sum + hour?.revenue, 0);
  
  // Identify busy periods (hours with above average activity)
  const avgTransactions = totalTransactions / data?.length || 0;
  const busyHours = data?.filter(hour => hour?.transactions > avgTransactions);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Clock" size={20} className="mr-2" />
            Peak Hour Analysis
          </h3>
          {peakHour?.hour && (
            <p className="text-sm text-muted-foreground mt-1">
              Peak hour: <span className="text-foreground font-medium">{peakHour?.hour}:00</span>
              {' '}({formatValue(peakHour?.[viewMode], viewMode)})
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {viewOptions?.map((option) => (
            <Button
              key={option?.key}
              variant={viewMode === option?.key ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(option?.key)}
              iconName={option?.icon}
              iconPosition="left"
              iconSize={16}
              className="touch-feedback"
            >
              {option?.label}
            </Button>
          ))}
          
          <div className="border-l border-border pl-2 ml-2">
            {chartOptions?.map((option) => (
              <Button
                key={option?.key}
                variant={chartType === option?.key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType(option?.key)}
                iconName={option?.icon}
                iconSize={16}
                className="touch-feedback"
              />
            ))}
          </div>
        </div>
      </div>
      {data?.length > 0 ? (
        <div className="space-y-6">
          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorPeakHour" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="hour"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tickFormatter={(value) => 
                      viewMode === 'revenue' ? `${(value / 1000)?.toFixed(0)}k` : value
                    }
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={viewMode}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPeakHour)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="hour"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tickFormatter={(value) => 
                      viewMode === 'revenue' ? `${(value / 1000)?.toFixed(0)}k` : value
                    }
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey={viewMode}
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Peak Hour Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={16} className="text-primary" />
                <h4 className="text-sm font-medium text-foreground">Peak Performance</h4>
              </div>
              <div className="text-lg font-bold text-primary">
                {peakHour?.hour}:00
              </div>
              <div className="text-xs text-muted-foreground">
                {formatValue(peakHour?.[viewMode], viewMode)}
              </div>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Clock" size={16} className="text-secondary" />
                <h4 className="text-sm font-medium text-foreground">Busy Hours</h4>
              </div>
              <div className="text-lg font-bold text-secondary">
                {busyHours?.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Above average activity
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="DollarSign" size={16} className="text-accent" />
                <h4 className="text-sm font-medium text-foreground">Hourly Average</h4>
              </div>
              <div className="text-lg font-bold text-accent">
                {viewMode === 'revenue' ? 
                  `KES ${(totalRevenue / data?.length)?.toFixed(0)}` :
                  Math.round(totalTransactions / data?.length)
                }
              </div>
              <div className="text-xs text-muted-foreground">
                Per hour today
              </div>
            </div>
          </div>

          {/* Hour-by-Hour Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Hourly Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data?.map((hour) => (
                <div 
                  key={hour?.hour} 
                  className={`p-3 border rounded-md transition-colors ${
                    hour === peakHour 
                      ? 'border-primary bg-primary/5' 
                      : hour?.transactions > avgTransactions
                        ? 'border-secondary bg-secondary/5' :'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-foreground">
                      {hour?.hour}:00
                    </div>
                    <div className="flex items-center space-x-1">
                      {hour === peakHour && (
                        <Icon name="Crown" size={14} className="text-primary" />
                      )}
                      {hour?.transactions > avgTransactions && hour !== peakHour && (
                        <Icon name="TrendingUp" size={14} className="text-secondary" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-1">
                    {hour?.transactions} transactions
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {formatValue(hour?.revenue, 'revenue')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Clock" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hourly data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeakHourAnalysis;