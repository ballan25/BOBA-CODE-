// src/pages/payment-processing-and-checkout/index.jsx
import React, { useState, useEffect } from 'react';
import { useProducts, useAsyncOperation } from '../../hooks/useDatabase';
import { TransactionService, ProductService } from '../../services/database';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import CashPaymentForm from './components/CashPaymentForm';
import MpesaPaymentForm from './components/MpesaPaymentForm';

const PaymentProcessing = () => {
  const { products, loading: productsLoading, updateStock } = useProducts();
  const { loading: transactionLoading, execute: processTransaction } = useAsyncOperation();
  
  const [cart, setCart] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [receipt, setReceipt] = useState(null);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  // Add item to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Process payment
  const handlePayment = async (paymentData) => {
    try {
      // Prepare transaction data
      const transactionData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        subtotal,
        tax,
        total,
        paymentMethod: selectedPaymentMethod,
        paymentData,
        cashierId: 'current-user', // Replace with actual user ID
        status: 'completed',
        timestamp: new Date()
      };

      // Process the transaction
      const transaction = await processTransaction(
        TransactionService.createTransaction,
        transactionData
      );

      // Update product stock
      await ProductService.batchUpdateStock(
        cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      );

      // Generate receipt
      setReceipt({
        ...transaction,
        printedAt: new Date()
      });

      // Clear cart
      setCart([]);
      setCurrentTransaction(transaction);

      return transaction;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  };

  // Print receipt
  const printReceipt = () => {
    if (!receipt) return;
    
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receipt.receiptNumber}</title>
          <style>
            body { font-family: monospace; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .line-item { display: flex; justify-content: space-between; }
            .total { border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>BOBA CAFÉ</h2>
            <p>Receipt #${receipt.receiptNumber}</p>
            <p>${new Date(receipt.createdAt?.toDate?.() || receipt.createdAt).toLocaleString()}</p>
          </div>
          
          <div class="items">
            ${receipt.items.map(item => `
              <div class="line-item">
                <span>${item.quantity}x ${item.name}</span>
                <span>$${item.subtotal.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div class="line-item">
              <span>Subtotal:</span>
              <span>$${receipt.subtotal.toFixed(2)}</span>
            </div>
            <div class="line-item">
              <span>Tax:</span>
              <span>$${receipt.tax.toFixed(2)}</span>
            </div>
            <div class="line-item">
              <strong>
                <span>Total:</span>
                <span>$${receipt.total.toFixed(2)}</span>
              </strong>
            </div>
            <div class="line-item">
              <span>Payment Method:</span>
              <span>${receipt.paymentMethod.toUpperCase()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Visit us again soon</p>
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  if (productsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Products Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => addToCart(product)}
              >
                <img
                  src={product.image || '/assets/images/no_image.png'}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                <p className="text-green-600 font-bold">${product.price.toFixed(2)}</p>
                <p className="text-gray-500 text-xs">Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cart and Payment */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Current Order</h3>
          
          {/* Cart Items */}
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">No items in cart</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-gray-600 text-xs">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 bg-red-500 text-white rounded text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 bg-green-500 text-white rounded text-xs"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 bg-red-600 text-white rounded text-xs ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary */}
          {cart.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {cart.length > 0 && (
            <div className="mt-6">
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onMethodChange={setSelectedPaymentMethod}
              />

              {/* Payment Form */}
              <div className="mt-4">
                {selectedPaymentMethod === 'cash' ? (
                  <CashPaymentForm
                    total={total}
                    onPayment={handlePayment}
                    loading={transactionLoading}
                  />
                ) : (
                  <MpesaPaymentForm
                    total={total}
                    onPayment={handlePayment}
                    loading={transactionLoading}
                  />
                )}
              </div>
            </div>
          )}

          {/* Receipt Section */}
          {receipt && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-800 font-medium">Payment Successful!</p>
                  <p className="text-green-600 text-sm">Receipt: {receipt.receiptNumber}</p>
                </div>
                <button
                  onClick={printReceipt}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessing;
