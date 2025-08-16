import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlertSystem = ({ alerts = [], onDismiss }) => {
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [expandedAlert, setExpandedAlert] = useState(null);

  useEffect(() => {
    // Show alerts with priority ordering and limit display
    const sortedAlerts = [...alerts]?.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities?.[b?.priority] - priorities?.[a?.priority];
    });
    
    setVisibleAlerts(sortedAlerts?.slice(0, 3)); // Show max 3 alerts
  }, [alerts]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      case 'success':
        return 'CheckCircle';
      default:
        return 'Bell';
    }
  };

  const getAlertColor = (type, priority) => {
    switch (type) {
      case 'error':
        return 'bg-error/10 border-error/20 text-error';
      case 'warning':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'info':
        return 'bg-info/10 border-info/20 text-info';
      case 'success':
        return 'bg-success/10 border-success/20 text-success';
      default:
        return 'bg-muted/10 border-muted/20 text-muted-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-error text-error-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-info text-info-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = parseISO(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(date, 'MMM dd, HH:mm');
  };

  const handleDismissAlert = (alertId, event) => {
    event?.stopPropagation();
    onDismiss?.(alertId);
    setVisibleAlerts(current => current?.filter(alert => alert?.id !== alertId));
  };

  const handleToggleExpanded = (alertId) => {
    setExpandedAlert(current => current === alertId ? null : alertId);
  };

  const handleDismissAll = () => {
    if (window.confirm('Dismiss all alerts?')) {
      visibleAlerts?.forEach(alert => onDismiss?.(alert?.id));
      setVisibleAlerts([]);
    }
  };

  const handleMarkAllRead = () => {
    alert('All alerts marked as read (mock functionality)');
  };

  if (visibleAlerts?.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Bell" size={20} className="text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">System Alerts</h3>
          <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {visibleAlerts?.length}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            iconName="CheckCheck"
            iconSize={14}
            className="touch-feedback text-xs"
          >
            Mark All Read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            iconName="X"
            iconSize={14}
            className="touch-feedback text-xs text-error hover:text-error"
          >
            Dismiss All
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {visibleAlerts?.map((alert) => (
          <div
            key={alert?.id}
            className={`border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-elevation-1 ${
              getAlertColor(alert?.type, alert?.priority)
            } ${expandedAlert === alert?.id ? 'shadow-elevation-2' : ''}`}
            onClick={() => handleToggleExpanded(alert?.id)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Icon 
                    name={getAlertIcon(alert?.type)} 
                    size={20} 
                    className="mt-0.5 flex-shrink-0" 
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {alert?.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(alert?.priority)}`}>
                        {alert?.priority?.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {alert?.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(alert?.timestamp)}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <Icon
                          name={expandedAlert === alert?.id ? "ChevronUp" : "ChevronDown"}
                          size={14}
                          className="text-muted-foreground"
                        />
                        <span className="text-xs text-muted-foreground">
                          {expandedAlert === alert?.id ? 'Less' : 'More'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDismissAlert(alert?.id, e)}
                  iconName="X"
                  iconSize={14}
                  className="touch-feedback ml-2 flex-shrink-0"
                  title="Dismiss alert"
                />
              </div>

              {/* Expanded Content */}
              {expandedAlert === alert?.id && (
                <div className="mt-4 pt-4 border-t border-current/10 animate-slide-down">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-2">Alert Details</h5>
                      <div className="space-y-1 text-foreground/80">
                        <div>Type: <span className="font-medium">{alert?.type?.toUpperCase()}</span></div>
                        <div>Priority: <span className="font-medium">{alert?.priority?.toUpperCase()}</span></div>
                        <div>Time: <span className="font-medium">{format(parseISO(alert?.timestamp), 'PPpp')}</span></div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Suggested Actions</h5>
                      <div className="space-y-2">
                        {alert?.type === 'warning' && alert?.title?.includes('Inventory') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e?.stopPropagation();
                                alert('Redirecting to inventory management (mock)');
                              }}
                              iconName="Package"
                              iconSize={14}
                              className="touch-feedback w-full justify-start"
                            >
                              Restock Item
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e?.stopPropagation();
                                alert('Setting up automatic reorder (mock)');
                              }}
                              iconName="RefreshCw"
                              iconSize={14}
                              className="touch-feedback w-full justify-start"
                            >
                              Auto Reorder
                            </Button>
                          </>
                        )}
                        
                        {alert?.type === 'info' && alert?.title?.includes('Target') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e?.stopPropagation();
                              alert('Viewing sales performance details (mock)');
                            }}
                            iconName="BarChart3"
                            iconSize={14}
                            className="touch-feedback w-full justify-start"
                          >
                            View Performance
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e?.stopPropagation();
                            alert('Snoozing alert for 1 hour (mock)');
                          }}
                          iconName="Clock"
                          iconSize={14}
                          className="touch-feedback w-full justify-start"
                        >
                          Snooze 1 Hour
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts?.length > visibleAlerts?.length && (
        <div className="mt-3 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleAlerts([...alerts]?.slice(0, alerts?.length))}
            className="touch-feedback"
          >
            Show {alerts?.length - visibleAlerts?.length} More Alert{alerts?.length - visibleAlerts?.length > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;