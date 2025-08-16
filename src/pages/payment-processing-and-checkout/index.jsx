import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import CashPaymentForm from './components/CashPaymentForm';
import MpesaPaymentForm from './components/MpesaPaymentForm';
import SplitPaymentForm from './components/SplitPaymentForm';
import TransactionSummary from './components/TransactionSummary';
import RefundModal from './components/RefundModal';

const PaymentProcessingAndCheckout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('method'); // method, payment, summary
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);

  // Mock user data - in real app, this would come from authentication context
  useEffect(() => {
    const mockUser = {
      id: 'user_001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@bobacafe.com',
      role: 'cashier' // or 'manager'
    };
    setUser(mockUser);

    // Mock order data from cart context
    const mockOrderData = {
      orderId: 'ORD' + Date.now()?.toString()?.slice(-6),
      items: [
        {
          id: 'drink_001',
          name: 'Classic Milk Tea',
          size: 'Large',
          price: 350,
          quantity: 2,
          toppings: ['Tapioca Pearls', 'Extra Sugar']
        },
        {
          id: 'drink_002',
          name: 'Taro Smoothie',
          size: 'Medium',
          price: 280,
          quantity: 1,
          toppings: ['Coconut Jelly']
        },
        {
          id: 'snack_001',
          name: 'Chicken Wings',
          price: 450,
          quantity: 1,
          toppings: []
        }
      ],
      subtotal: 1430,
      tax: 0,
      total: 1430,
      timestamp: new Date()?.toISOString()
    };
    setOrderData(mockOrderData);
  }, []);

  const handleLogout = () => {
    setUser(null);
    navigate('/staff-login-and-authentication');
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (paymentDetails) => {
    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      setPaymentData({
        ...paymentDetails,
        orderId: orderData?.orderId,
        tipAmount: tipAmount
      });
      setCurrentStep('summary');
      setIsProcessing(false);
    }, 1500);
  };

  const handleBackToMethod = () => {
    setCurrentStep('method');
    setSelectedPaymentMethod('');
  };

  const handlePrintReceipt = () => {
    // Mock receipt printing
    const receiptWindow = window.open('', '_blank');
    receiptWindow?.document?.write(`
      <html>
        <head>
          <title>Receipt - ${orderData?.orderId}</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Boba POS System</h2>
            <p>Receipt #${orderData?.orderId}</p>
            <p>${new Date(paymentData.timestamp)?.toLocaleString('en-KE')}</p>
          </div>
          ${orderData?.items?.map(item => `
            <div class="item">
              <span>${item?.name} (${item?.size || 'Regular'}) x${item?.quantity}</span>
              <span>KES ${(item?.price * item?.quantity)?.toFixed(2)}</span>
            </div>
          `)?.join('')}
          <div class="total">
            <div class="item">
              <span>Total:</span>
              <span>KES ${orderData?.total?.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Payment:</span>
              <span>${paymentData?.method?.toUpperCase()}</span>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `);
    receiptWindow?.document?.close();
    receiptWindow?.print();
  };

  const handleEmailReceipt = () => {
    // Mock email receipt
    alert('Receipt sent to customer email (mock functionality)');
  };

  const handleSMSReceipt = () => {
    // Mock SMS receipt
    alert('Receipt sent via SMS (mock functionality)');
  };

  const handleNewOrder = () => {
    navigate('/point-of-sale-order-processing');
  };

  const handleCloseTransaction = () => {
    navigate('/point-of-sale-order-processing');
  };

  const handleRefundComplete = (refundData) => {
    alert(`Refund processed: ${refundData?.refundId}\nAmount: KES ${refundData?.amount?.toFixed(2)}`);
    setShowRefundModal(false);
  };

  if (!user || !orderData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Payment Processing & Checkout
                </h1>
                <p className="text-muted-foreground">
                  Complete customer payment with multiple payment options
                </p>
              </div>
              
              {currentStep === 'summary' && user?.role === 'manager' && (
                <Button
                  variant="outline"
                  onClick={() => setShowRefundModal(true)}
                  iconName="RefreshCw"
                  iconPosition="left"
                  className="touch-feedback"
                >
                  Process Refund
                </Button>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${
                  currentStep === 'method' ? 'text-primary' : 
                  currentStep === 'payment' || currentStep === 'summary' ? 'text-success' : 'text-muted-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep === 'method' ? 'border-primary bg-primary text-white' :
                    currentStep === 'payment'|| currentStep === 'summary' ? 'border-success bg-success text-white' : 'border-muted-foreground'
                  }`}>
                    {currentStep === 'payment' || currentStep === 'summary' ? (
                      <Icon name="Check" size={16} />
                    ) : (
                      '1'
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">Payment Method</span>
                </div>
                
                <div className={`w-8 h-0.5 ${
                  currentStep === 'payment' || currentStep === 'summary' ? 'bg-success' : 'bg-muted'
                }`} />
                
                <div className={`flex items-center ${
                  currentStep === 'payment' ? 'text-primary' :
                  currentStep === 'summary' ? 'text-success' : 'text-muted-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep === 'payment' ? 'border-primary bg-primary text-white' :
                    currentStep === 'summary'? 'border-success bg-success text-white' : 'border-muted-foreground'
                  }`}>
                    {currentStep === 'summary' ? (
                      <Icon name="Check" size={16} />
                    ) : (
                      '2'
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">Process Payment</span>
                </div>
                
                <div className={`w-8 h-0.5 ${
                  currentStep === 'summary' ? 'bg-success' : 'bg-muted'
                }`} />
                
                <div className={`flex items-center ${
                  currentStep === 'summary' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep === 'summary' ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Complete</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Icon name="ShoppingBag" size={20} className="mr-2" />
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    {orderData?.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item?.name}</div>
                          {item?.size && (
                            <div className="text-muted-foreground text-xs">Size: {item?.size}</div>
                          )}
                          {item?.toppings && item?.toppings?.length > 0 && (
                            <div className="text-muted-foreground text-xs">
                              {item?.toppings?.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div>x{item?.quantity}</div>
                          <div className="font-medium">
                            KES {(item?.price * item?.quantity)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Subtotal:</span>
                      <span>KES {orderData?.subtotal?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tip:</span>
                        <span>KES {tipAmount?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-primary">
                      <span>Total:</span>
                      <span>KES {(orderData?.total + tipAmount)?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Payment Area */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-6">
                  {currentStep === 'method' && (
                    <PaymentMethodSelector
                      selectedMethod={selectedPaymentMethod}
                      onMethodSelect={handlePaymentMethodSelect}
                      total={orderData?.total + tipAmount}
                      isProcessing={isProcessing}
                    />
                  )}

                  {currentStep === 'payment' && selectedPaymentMethod === 'cash' && (
                    <CashPaymentForm
                      total={orderData?.total + tipAmount}
                      onPaymentComplete={handlePaymentComplete}
                      isProcessing={isProcessing}
                      onCancel={handleBackToMethod}
                    />
                  )}

                  {currentStep === 'payment' && selectedPaymentMethod === 'mpesa' && (
                    <MpesaPaymentForm
                      total={orderData?.total + tipAmount}
                      onPaymentComplete={handlePaymentComplete}
                      isProcessing={isProcessing}
                      onCancel={handleBackToMethod}
                    />
                  )}

                  {currentStep === 'payment' && selectedPaymentMethod === 'split' && (
                    <SplitPaymentForm
                      total={orderData?.total + tipAmount}
                      onPaymentComplete={handlePaymentComplete}
                      isProcessing={isProcessing}
                      onCancel={handleBackToMethod}
                    />
                  )}

                  {currentStep === 'summary' && paymentData && (
                    <TransactionSummary
                      orderData={orderData}
                      paymentData={paymentData}
                      onPrintReceipt={handlePrintReceipt}
                      onEmailReceipt={handleEmailReceipt}
                      onSMSReceipt={handleSMSReceipt}
                      onNewOrder={handleNewOrder}
                      onClose={handleCloseTransaction}
                      user={user}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Refund Modal */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        orderData={{
          ...orderData,
          paymentMethod: paymentData?.method
        }}
        onRefundComplete={handleRefundComplete}
        user={user}
      />
    </div>
  );
};

export default PaymentProcessingAndCheckout;