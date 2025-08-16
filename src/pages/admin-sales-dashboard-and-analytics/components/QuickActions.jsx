import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onExport, onRefresh, user }) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'export',
      label: 'Export Data',
      icon: 'Download',
      variant: 'default',
      onClick: onExport,
      description: 'Export dashboard data to CSV/PDF'
    },
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: 'RefreshCw',
      variant: 'outline',
      onClick: onRefresh,
      description: 'Reload all dashboard data'
    },
    {
      id: 'pos',
      label: 'Go to POS',
      icon: 'ShoppingCart',
      variant: 'outline',
      onClick: () => navigate('/point-of-sale-order-processing'),
      description: 'Switch to POS system'
    },
    {
      id: 'receipts',
      label: 'Receipt Manager',
      icon: 'Receipt',
      variant: 'outline',
      onClick: () => navigate('/receipt-generation-and-management'),
      description: 'Manage receipt templates and printing'
    },
    {
      id: 'backup',
      label: 'Backup Data',
      icon: 'Database',
      variant: 'outline',
      onClick: () => alert('Backup started (mock functionality)'),
      description: 'Create data backup',
      managerOnly: true
    },
    {
      id: 'settings',
      label: 'Dashboard Settings',
      icon: 'Settings',
      variant: 'ghost',
      onClick: () => alert('Dashboard settings (mock functionality)'),
      description: 'Configure dashboard preferences'
    }
  ];

  const visibleActions = actions?.filter(action => 
    !action?.managerOnly || user?.role === 'manager'
  );

  const handleKeyboardShortcut = (action) => {
    // Mock keyboard shortcut handling
    const shortcuts = {
      'export': 'Ctrl+E',
      'refresh': 'F5',
      'pos': 'Ctrl+P',
      'receipts': 'Ctrl+R'
    };
    
    return shortcuts?.[action?.id] || null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Zap" size={20} className="mr-2" />
          Quick Actions
        </h3>
        <div className="text-xs text-muted-foreground">
          Keyboard shortcuts available
        </div>
      </div>

      <div className="space-y-3">
        {visibleActions?.map((action) => {
          const shortcut = handleKeyboardShortcut(action);
          
          return (
            <div key={action?.id} className="group relative">
              <Button
                variant={action?.variant}
                size="sm"
                onClick={action?.onClick}
                iconName={action?.icon}
                iconPosition="left"
                iconSize={16}
                className="w-full justify-start touch-feedback group-hover:scale-[1.02] transition-transform"
              >
                <div className="flex-1 text-left">
                  <div className="font-medium">{action?.label}</div>
                  {shortcut && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {shortcut}
                    </div>
                  )}
                </div>
              </Button>
              
              {/* Tooltip */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 bg-popover border border-border rounded-md px-3 py-2 text-xs text-popover-foreground shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 whitespace-nowrap">
                {action?.description}
                {shortcut && (
                  <div className="text-muted-foreground mt-1">
                    Press {shortcut}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">System Status</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Sync:</span>
            <div className="flex items-center space-x-1">
              <Icon name="CheckCircle" size={12} className="text-success" />
              <span className="text-foreground">2 min ago</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Data Status:</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-foreground">Real-time</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Storage:</span>
            <span className="text-foreground">2.1GB / 5GB</span>
          </div>
        </div>
      </div>

      {/* Daily Target Progress */}
      <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={14} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Daily Target</span>
          </div>
          <span className="text-xs text-primary">87%</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: '87%' }}
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          KES 43,500 / KES 50,000
        </div>
      </div>
    </div>
  );
};

export default QuickActions;