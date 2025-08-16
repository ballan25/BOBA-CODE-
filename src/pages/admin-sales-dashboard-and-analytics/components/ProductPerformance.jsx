import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductPerformance = ({ data = [] }) => {
  const [viewMode, setViewMode] = useState('revenue'); // revenue, quantity, growth
  const [chartType, setChartType] = useState('bar'); // bar, pie

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))', 
    'hsl(var(--accent))',
    'hsl(var(--muted-foreground))',
    'hsl(var(--warning))'
  ];

  const viewOptions = [
    { key: 'revenue', label: 'Revenue', icon: 'DollarSign' },
    { key: 'quantity', label: 'Quantity', icon: 'Package' },
    { key: 'growth', label: 'Growth', icon: 'TrendingUp' }
  ];

  const chartOptions = [
    { key: 'bar', label: 'Bar', icon: 'BarChart3' },
    { key: 'pie', label: 'Pie', icon: 'PieChart' }
  ];

  const formatValue = (value, type) => {
    switch (type) {
      case 'revenue':
        return `KES ${value?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
      case 'quantity':
        return `${value} units`;
      case 'growth':
        return `${value > 0 ? '+' : ''}${value?.toFixed(1)}%`;
      default:
        return value;
    }
  };

  const getGrowthColor = (growth) => {
    if (growth > 10) return 'text-success';
    if (growth > 0) return 'text-warning';
    return 'text-error';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-medium">{formatValue(data?.revenue, 'revenue')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-medium">{formatValue(data?.quantity, 'quantity')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Growth:</span>
              <span className={`font-medium ${getGrowthColor(data?.growth)}`}>
                {formatValue(data?.growth, 'growth')}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{data?.name}</p>
          <div className="text-sm">
            <span className="text-muted-foreground">Value:</span>
            <span className="font-medium ml-2">{formatValue(data?.[viewMode], viewMode)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const sortedData = [...data]?.sort((a, b) => b?.[viewMode] - a?.[viewMode]);
  const topProduct = sortedData?.[0];
  const totalRevenue = data?.reduce((sum, item) => sum + item?.revenue, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Package" size={20} className="mr-2" />
            Product Performance
          </h3>
          {topProduct && (
            <p className="text-sm text-muted-foreground mt-1">
              Top performer: <span className="text-foreground font-medium">{topProduct?.name}</span>
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
              {chartType === 'bar' ? (
                <BarChart data={sortedData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    type="number"
                    tickFormatter={(value) => 
                      viewMode === 'revenue' ? `${(value / 1000)?.toFixed(0)}k` :
                      viewMode === 'growth' ? `${value}%` : value
                    }
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    width={120}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey={viewMode}
                    fill={viewMode === 'growth' ? undefined : 'hsl(var(--primary))'}
                    radius={[0, 4, 4, 0]}
                  >
                    {viewMode === 'growth' && 
                      sortedData?.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry?.growth > 10 ? 'hsl(var(--success))' : 
                                entry?.growth > 0 ? 'hsl(var(--warning))': 'hsl(var(--error))'}
                        />
                      ))
                    }
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={sortedData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey={viewMode}
                    label={({ name, value }) => 
                      `${name}: ${viewMode === 'revenue' ? `${(value / 1000)?.toFixed(0)}k` : 
                                  viewMode === 'growth' ? `${value}%` : value}`
                    }
                  >
                    {sortedData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Product Rankings */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">Product Rankings</h4>
            <div className="space-y-3">
              {sortedData?.map((product, index) => (
                <div key={product?.name} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white': 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{product?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatValue(product?.quantity, 'quantity')} sold
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      {formatValue(product?.[viewMode], viewMode)}
                    </div>
                    <div className={`text-xs ${getGrowthColor(product?.growth)}`}>
                      {formatValue(product?.growth, 'growth')} growth
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No product data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPerformance;