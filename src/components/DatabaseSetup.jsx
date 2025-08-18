// src/components/DatabaseSetup.jsx
import React, { useState, useEffect } from 'react';
import { useDatabaseStatus } from '../hooks/useDatabase';
import { initializeDatabase, resetDatabase } from '../scripts/initializeDatabase';
import { checkDatabaseHealth } from '../services/database';

const DatabaseSetup = () => {
  const [setupStatus, setSetupStatus] = useState('checking'); // checking, ready, initializing, complete, error
  const [setupProgress, setSetupProgress] = useState(0);
  const [setupMessage, setSetupMessage] = useState('Checking database status...');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [initializationResult, setInitializationResult] = useState(null);

  const { status: dbStatus, lastCheck, checkStatus } = useDatabaseStatus();

  // Check if database needs initialization
  const checkInitializationStatus = async () => {
    try {
      setSetupStatus('checking');
      setSetupMessage('Checking database configuration...');
      
      const healthCheck = await checkDatabaseHealth();
      
      if (healthCheck.status === 'healthy') {
        setSetupStatus('ready');
        setSetupMessage('Database is connected and ready');
      } else {
        setSetupStatus('error');
        setSetupMessage('Database connection failed: ' + (healthCheck.error || 'Unknown error'));
      }
    } catch (error) {
      setSetupStatus('error');
      setSetupMessage('Failed to check database status: ' + error.message);
    }
  };

  useEffect(() => {
    checkInitializationStatus();
  }, []);

  // Handle database initialization
  const handleInitialization = async () => {
    try {
      setSetupStatus('initializing');
      setSetupProgress(10);
      setSetupMessage('Starting database initialization...');

      const result = await initializeDatabase();

      if (result.success) {
        setSetupStatus('complete');
        setSetupProgress(100);
        setSetupMessage('Database initialized successfully!');
        setInitializationResult(result);
      } else {
        setSetupStatus('error');
        setSetupMessage('Initialization failed: ' + result.message);
      }
    } catch (error) {
      setSetupStatus('error');
      setSetupMessage('Initialization failed: ' + error.message);
      console.error('Database initialization error:', error);
    }
  };

  // Handle database reset
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the database? This will delete all data!')) {
      return;
    }

    try {
      setSetupStatus('initializing');
      setSetupMessage('Resetting database...');
      
      const result = await resetDatabase();
      
      if (result.success) {
        setSetupMessage('Database reset successfully');
        checkInitializationStatus();
      } else {
        setSetupStatus('error');
        setSetupMessage('Reset failed: ' + result.message);
      }
    } catch (error) {
      setSetupStatus('error');
      setSetupMessage('Reset failed: ' + error.message);
    }
  };

  // Render status icon
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'checking':
        return (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        );
      case 'ready':
        return (
          <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'initializing':
        return (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
        );
      case 'complete':
        return (
          <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // If setup is complete and database is ready, don't show this component
  if (setupStatus === 'complete' && dbStatus === 'healthy') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Database Setup
          </h2>
          <p className="text-gray-600">
            Let's get your POS system ready for production
          </p>
        </div>

        {/* Status Display */}
        <div className="flex items-center space-x-3 mb-6">
          {renderStatusIcon(setupStatus)}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {setupMessage}
            </p>
            {lastCheck && (
              <p className="text-xs text-gray-500">
                Last checked: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {setupStatus === 'initializing' && (
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${setupProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Initialization Results */}
        {initializationResult && setupStatus === 'complete' && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Initialization Complete!
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ Products: {initializationResult.products} items</li>
              <li>✅ Database connection established</li>
              <li>✅ Collections created and configured</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {setupStatus === 'ready' && (
            <button
              onClick={handleInitialization}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Initialize Database
            </button>
          )}

          {setupStatus === 'error' && (
            <button
              onClick={checkInitializationStatus}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retry Connection
            </button>
          )}

          {setupStatus === 'complete' && (
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue to Dashboard
            </button>
          )}
        </div>

        {/* Advanced Options */}
        <div className="mt-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-3">
              <button
                onClick={checkStatus}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Check Database Health
              </button>

              <button
                onClick={handleReset}
                className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"
              >
                Reset Database (Danger)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Make sure your Firebase configuration is correct in your environment variables
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
