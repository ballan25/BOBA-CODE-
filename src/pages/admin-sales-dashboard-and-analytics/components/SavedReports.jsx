import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SavedReports = () => {
  const [savedReports, setSavedReports] = useState([
    {
      id: 'report_001',
      name: 'Weekly Sales Summary',
      dateRange: { start: '2025-01-01', end: '2025-01-07' },
      filters: ['Sarah Johnson', 'Mike Chen'],
      createdAt: '2025-01-07T10:30:00Z',
      description: 'Weekly overview with top performers'
    },
    {
      id: 'report_002', 
      name: 'Monthly Performance',
      dateRange: { start: '2024-12-01', end: '2024-12-31' },
      filters: [],
      createdAt: '2025-01-01T09:15:00Z',
      description: 'Complete December performance analysis'
    },
    {
      id: 'report_003',
      name: 'Peak Hours Analysis',
      dateRange: { start: '2025-01-03', end: '2025-01-05' },
      filters: ['Mike Chen'],
      createdAt: '2025-01-06T14:20:00Z',
      description: 'Weekend rush hour patterns'
    }
  ]);
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const handleLoadReport = (report) => {
    // Mock loading report
    console.log('Loading report:', report);
    alert(`Loading report: ${report?.name}`);
  };

  const handleSaveCurrentReport = () => {
    if (!reportName?.trim()) {
      alert('Please enter a report name');
      return;
    }

    const newReport = {
      id: `report_${Date.now()}`,
      name: reportName?.trim(),
      description: reportDescription?.trim() || 'Custom saved report',
      dateRange: { start: '2025-01-01', end: '2025-01-07' }, // Current date range
      filters: [], // Current filters
      createdAt: new Date()?.toISOString()
    };

    setSavedReports([newReport, ...savedReports]);
    setReportName('');
    setReportDescription('');
    setShowSaveModal(false);
    
    alert(`Report "${newReport?.name}" saved successfully!`);
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setSavedReports(savedReports?.filter(report => report?.id !== reportId));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = (dateRange) => {
    return `${formatDate(dateRange?.start)} - ${formatDate(dateRange?.end)}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="BookOpen" size={20} className="mr-2" />
          Saved Reports
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveModal(true)}
          iconName="Plus"
          iconSize={14}
          className="touch-feedback"
        >
          Save Current
        </Button>
      </div>

      <div className="space-y-3">
        {savedReports?.map((report) => (
          <div key={report?.id} className="border border-border rounded-md p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {report?.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {report?.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  {formatDateRange(report?.dateRange)}
                  {report?.filters?.length > 0 && (
                    <span> • {report?.filters?.length} filter{report?.filters?.length > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLoadReport(report)}
                  iconName="Download"
                  iconSize={14}
                  className="touch-feedback"
                  title="Load this report"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteReport(report?.id)}
                  iconName="Trash2"
                  iconSize={14}
                  className="touch-feedback text-error hover:text-error"
                  title="Delete this report"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {savedReports?.length === 0 && (
        <div className="text-center py-6">
          <Icon name="FileText" size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No saved reports yet</p>
        </div>
      )}

      {/* Save Report Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Save Current Report</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSaveModal(false)}
                iconName="X"
                iconSize={16}
                className="touch-feedback"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Report Name *
                </label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e?.target?.value)}
                  placeholder="Enter report name..."
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Input
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e?.target?.value)}
                  placeholder="Brief description (optional)..."
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveModal(false)}
                  className="touch-feedback"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCurrentReport}
                  className="touch-feedback"
                  iconName="Save"
                  iconPosition="left"
                >
                  Save Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedReports;