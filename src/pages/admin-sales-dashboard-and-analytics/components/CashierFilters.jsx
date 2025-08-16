import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const CashierFilters = ({ cashiers = [], selectedCashiers = [], onChange }) => {
  const handleCashierToggle = (cashierName) => {
    const updatedSelection = selectedCashiers?.includes(cashierName)
      ? selectedCashiers?.filter(name => name !== cashierName)
      : [...selectedCashiers, cashierName];
    
    onChange?.(updatedSelection);
  };

  const handleSelectAll = () => {
    if (selectedCashiers?.length === cashiers?.length) {
      onChange?.([]);
    } else {
      onChange?.(cashiers?.map(cashier => cashier?.name));
    }
  };

  const handleClearAll = () => {
    onChange?.([]);
  };

  const getShiftColor = (shift) => {
    switch (shift?.toLowerCase()) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-800';
      case 'afternoon':
        return 'bg-blue-100 text-blue-800';
      case 'evening':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Users" size={20} className="mr-2" />
          Cashier Filters
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs touch-feedback"
          >
            {selectedCashiers?.length === cashiers?.length ? 'Deselect' : 'Select'} All
          </Button>
          {selectedCashiers?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs text-error touch-feedback"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {cashiers?.map((cashier) => (
          <div key={cashier?.id} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3 flex-1">
              <Checkbox
                checked={selectedCashiers?.includes(cashier?.name)}
                onChange={() => handleCashierToggle(cashier?.name)}
                className="touch-feedback"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">
                    {cashier?.name}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShiftColor(cashier?.shift)}`}>
                    {cashier?.shift}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {cashier?.transactions} transactions • KES {cashier?.revenue?.toLocaleString('en-KE')}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center text-sm">
                <Icon 
                  name={cashier?.efficiency > 90 ? "TrendingUp" : cashier?.efficiency > 80 ? "Minus" : "TrendingDown"} 
                  size={14} 
                  className={`mr-1 ${
                    cashier?.efficiency > 90 ? 'text-success' : 
                    cashier?.efficiency > 80 ? 'text-warning' : 'text-error'
                  }`} 
                />
                <span className="font-medium">{cashier?.efficiency?.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-muted-foreground">efficiency</div>
            </div>
          </div>
        ))}
      </div>

      {selectedCashiers?.length > 0 && (
        <div className="mt-4 p-3 bg-primary/10 rounded-md">
          <div className="text-xs text-primary font-medium mb-1">
            Filtering by {selectedCashiers?.length} cashier{selectedCashiers?.length > 1 ? 's' : ''}:
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedCashiers?.map((name) => (
              <span key={name} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-muted-foreground">
        <Icon name="Info" size={12} className="inline mr-1" />
        Filter affects all dashboard data including charts and reports
      </div>
    </div>
  );
};

export default CashierFilters;