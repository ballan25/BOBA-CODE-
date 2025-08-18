import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TransactionFeed from '../admin-sales-dashboard-and-analytics/components/TransactionFeed';

const CashierRecentTransactions = () => {
  const navigate = useNavigate();
  const [user] = useState({
    id: 'CSH001',
    name: 'Sarah Wanjiku',
    email: 'sarah.wanjiku@bobacafe.co.ke',
    role: 'cashier'
  });

  const handleLogout = () => {
    navigate('/staff-login-and-authentication');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      <div className="pt-16 p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-4">Recent Transactions</h1>
        <p className="text-sm text-muted-foreground mb-4">
          View recent transactions. These records are read-only.
        </p>
        <TransactionFeed showActions={false} />
      </div>
    </div>
  );
};

export default CashierRecentTransactions;
