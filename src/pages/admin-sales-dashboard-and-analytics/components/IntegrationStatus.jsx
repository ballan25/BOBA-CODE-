import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const IntegrationStatus = ({ firestoreStatus, mpesaApiStatus }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [lastSync, setLastSync] = useState(new Date(Date.now() - 120000)); // 2 minutes ago

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const handleRefreshStatus = () => {
    // Mock refresh functionality
    setLastSync(new Date());
    alert('Integration status refreshed');
  };

  const integrationData = [
    {
      name: 'Firestore Database',
      status: firestoreStatus,
      description: 'Real-time data synchronization',
      lastActivity: formatTimestamp(lastSync),
      details: {
        'Connection': firestoreStatus === 'connected' ? 'Stable' : 'Unstable',
        'Latency': '45ms',
        'Sync Rate': '99.8%',
        'Last Error': firestoreStatus === 'error' ? '2 hours ago' : 'None'
      }
    },
    {
      name: 'M-Pesa API',
      status: mpesaApiStatus,
      description: 'Payment processing service',
      lastActivity: formatTimestamp(new Date(Date.now() - 30000)), // 30 seconds ago
      details: {
        'Status': mpesaApiStatus === 'connected' ? 'Active' : 'Inactive',
        'Success Rate': '99.2%',
        'Avg Response': '1.2s',
        'Last Transaction': '30s ago'
      }
    }
  ];

  const overallStatus = firestoreStatus === 'connected' && mpesaApiStatus === 'connected' ?'connected' 
    : (firestoreStatus === 'error' || mpesaApiStatus === 'error') 
      ? 'error' :'warning';

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className={`touch-feedback ${getStatusColor(overallStatus)}`}
      >
        <div className="flex items-center space-x-2">
          <Icon name={getStatusIcon(overallStatus)} size={16} />
          <span>Integrations</span>
          <div className={`w-2 h-2 rounded-full ${
            overallStatus === 'connected' ? 'bg-success animate-pulse' : 
            overallStatus === 'error' ? 'bg-error' : 'bg-warning'
          }`} />
        </div>
      </Button>

      {/* Status Dropdown */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevation-3 z-50 animate-slide-up">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Integration Status</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshStatus}
                  iconName="RefreshCw"
                  iconSize={14}
                  className="touch-feedback"
                  title="Refresh status"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  iconName="X"
                  iconSize={14}
                  className="touch-feedback"
                />
              </div>
            </div>

            <div className="space-y-4">
              {integrationData?.map((integration) => (
                <div key={integration?.name} className="border border-border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getStatusIcon(integration?.status)} 
                        size={16} 
                        className={getStatusColor(integration?.status)} 
                      />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {integration?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {integration?.description}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${getStatusColor(integration?.status)}`}>
                      {getStatusText(integration?.status)}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mb-3">
                    Last activity: {integration?.lastActivity}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object?.entries(integration?.details)?.map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="text-foreground font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground text-center">
                Auto-refresh every 30 seconds
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default IntegrationStatus;