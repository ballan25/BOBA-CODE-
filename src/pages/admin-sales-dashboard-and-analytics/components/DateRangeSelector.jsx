import React, { useState } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const DateRangeSelector = ({ dateRange, onChange }) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customStart, setCustomStart] = useState(format(dateRange?.startDate, 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(dateRange?.endDate, 'yyyy-MM-dd'));

  const quickRanges = [
    {
      label: 'Today',
      getValue: () => ({
        startDate: new Date(),
        endDate: new Date()
      })
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          startDate: yesterday,
          endDate: yesterday
        };
      }
    },
    {
      label: 'Last 7 Days',
      getValue: () => ({
        startDate: subDays(new Date(), 6),
        endDate: new Date()
      })
    },
    {
      label: 'This Week',
      getValue: () => ({
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date())
      })
    },
    {
      label: 'This Month',
      getValue: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date())
      })
    },
    {
      label: 'Last 30 Days',
      getValue: () => ({
        startDate: subDays(new Date(), 29),
        endDate: new Date()
      })
    }
  ];

  const handleQuickRange = (range) => {
    const newRange = range?.getValue();
    onChange?.(newRange);
    setIsCustomMode(false);
  };

  const handleCustomRange = () => {
    const newRange = {
      startDate: new Date(customStart),
      endDate: new Date(customEnd)
    };
    
    if (newRange?.startDate <= newRange?.endDate) {
      onChange?.(newRange);
      setIsCustomMode(false);
    } else {
      alert('Start date must be before end date');
    }
  };

  const isActiveRange = (range) => {
    const rangeValue = range?.getValue();
    return format(rangeValue?.startDate, 'yyyy-MM-dd') === format(dateRange?.startDate, 'yyyy-MM-dd') &&
           format(rangeValue?.endDate, 'yyyy-MM-dd') === format(dateRange?.endDate, 'yyyy-MM-dd');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Calendar" size={20} className="mr-2" />
          Date Range
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCustomMode(!isCustomMode)}
          iconName={isCustomMode ? "X" : "Settings"}
          iconSize={16}
          className="touch-feedback"
        >
          {isCustomMode ? 'Cancel' : 'Custom'}
        </Button>
      </div>

      {!isCustomMode ? (
        <div className="space-y-2">
          {quickRanges?.map((range, index) => (
            <button
              key={index}
              onClick={() => handleQuickRange(range)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors touch-feedback ${
                isActiveRange(range)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {range?.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e?.target?.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e?.target?.value)}
              className="w-full"
            />
          </div>
          
          <Button
            onClick={handleCustomRange}
            className="w-full touch-feedback"
            iconName="Check"
            iconPosition="left"
          >
            Apply Range
          </Button>
        </div>
      )}

      <div className="mt-4 p-3 bg-muted/50 rounded-md">
        <div className="text-xs text-muted-foreground mb-1">Current Range:</div>
        <div className="text-sm font-medium text-foreground">
          {format(dateRange?.startDate, 'MMM dd, yyyy')} - {format(dateRange?.endDate, 'MMM dd, yyyy')}
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector;