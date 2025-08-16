import React from 'react';
import Icon from '../../../components/AppIcon';

const KPIWidget = ({ title, value, change, icon, prefix = 'KES', suffix = '' }) => {
  const isPositive = change > 0;
  const changeColor = isPositive ? 'text-success' : 'text-error';
  const changeIcon = isPositive ? 'TrendingUp' : 'TrendingDown';

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={20} className="text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <div className={`flex items-center text-sm ${changeColor}`}>
          <Icon name={changeIcon} size={14} className="mr-1" />
          <span>{Math.abs(change)?.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="text-2xl font-bold text-foreground">
        {prefix && `${prefix} `}
        {typeof value === 'number' ? value?.toLocaleString('en-KE', { 
          minimumFractionDigits: prefix === 'KES' ? 2 : 0 
        }) : value}
        {suffix && ` ${suffix}`}
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        vs. previous period
      </div>
    </div>
  );
};

const KPIWidgets = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)]?.map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-elevation-1 animate-pulse">
            <div className="h-4 bg-muted rounded mb-4"></div>
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPIWidget
        title="Daily Revenue"
        value={data?.dailyRevenue}
        change={data?.dailyRevenueChange}
        icon="DollarSign"
        prefix="KES"
      />
      
      <KPIWidget
        title="Transaction Count"
        value={data?.transactionCount}
        change={data?.transactionCountChange}
        icon="ShoppingBag"
        prefix=""
      />
      
      <KPIWidget
        title="Average Order Value"
        value={data?.averageOrderValue}
        change={data?.averageOrderValueChange}
        icon="TrendingUp"
        prefix="KES"
      />
      
      <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="CreditCard" size={20} className="text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Payment Methods</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-foreground">M-Pesa</span>
            </div>
            <div className="text-sm font-medium">
              {data?.mpesaRatio?.toFixed(1)}%
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
              <span className="text-sm text-foreground">Cash</span>
            </div>
            <div className="text-sm font-medium">
              {data?.cashRatio?.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${data?.mpesaRatio}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          M-Pesa usage trending {data?.mpesaRatioChange > 0 ? 'up' : 'down'} by {Math.abs(data?.mpesaRatioChange)?.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default KPIWidgets;