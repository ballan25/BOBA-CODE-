import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import CartPanel from './components/CartPanel';
import SizeSelectionModal from './components/SizeSelectionModal';
import StatusIndicators from './components/StatusIndicators';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PointOfSaleOrderProcessing = () => {
  const navigate = useNavigate();
  const [currentUser] = useState({
    id: 'CSH001',
    name: 'Sarah Wanjiku',
    email: 'sarah.wanjiku@bobacafe.co.ke',
    role: 'cashier'
  });

  const [categories] = useState([
    { id: 'fruit-teas', name: 'Fruit Teas' },
    { id: 'milk-teas', name: 'Milk Teas' },
    { id: 'cake-milk-teas', name: 'Cake Milk Teas (Smoothies)' },
    { id: 'milkshakes', name: 'Milkshakes' },
    { id: 'mojitos-mocktails', name: 'Mojitos & Mocktails' },
    { id: 'boba-jellies', name: 'Boba & Jellies' }
  ]);

  const [products] = useState([
    // Fruit Teas
    { id: 'fruit-001', name: 'Lemon fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    { id: 'fruit-002', name: 'Blueberry fruit tea', category: 'fruit-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    // ... other fruit teas ...
    // Milk Teas
    { id: 'milk-001', name: 'Taro milk tea', category: 'milk-teas', 
      sizes: [
        { id: 'medium', name: 'Medium', price: 400 },
        { id: 'large', name: 'Large', price: 500 }
      ],
      image: '/assets/images/taro-milk-tea.jpg'
    },
    { id: 'milk-002', name: 'Hazelnut milk tea', category: 'milk-teas', sizes: [
      { id: 'medium', name: 'Medium', price: 400 },
      { id: 'large', name: 'Large', price: 500 }
    ]},
    // ... other milk teas ...
    // Cake Milk Teas (Smoothies)
    { id: 'cake-001', name: 'Strawberry cake milk tea', category: 'cake-milk-teas', 
      sizes: [
        { id: 'medium', name: 'Medium', price: 500 },
        { id: 'large', name: 'Large', price: 600 }
      ],
      image: '/assets/images/strawberry-cake-milk-tea.jpg'
    },
    // ... other cake milk teas ...
    // Milkshakes
    { id: 'shake-001', name: 'Vanilla milkshake', category: 'milkshakes', 
      sizes: [
        { id: 'medium', name: 'Medium', price: 400 },
        { id: 'large', name: 'Large', price: 500 }
      ],
      image: '/assets/images/vanilla-milkshake.jpg'
    },
    // ... other milkshakes ...
    // Mojitos & Mocktails
    // ... mojitos & mocktails ...
    // Boba & Jellies
    // ... boba & jellies ...
  ]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    mpesa: 'connected',
    firestore: 'connected',
    lastSync: new Date()?.toISOString()
  });

  const [recentOrders] = useState([]);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products?.filter(product => product?.category === activeCategory);

  const cartTotal = cartItems?.reduce((total, item) => total + (item?.price * item?.quantity), 0);

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  const handleAddToCart = useCallback((product) => {
    const cartId = `${product?.id}-${Date.now()}-${Math.random()}`;
    const newItem = {
      ...product,
      cartId,
      quantity: 1
    };
    setCartItems(prev => [...prev, newItem]);
  }, []);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    setShowSizeModal(true);
  }, []);

  const handleUpdateQuantity = useCallback((cartId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev?.filter(item => item?.cartId !== cartId));
    } else {
      setCartItems(prev => prev?.map(item => 
        item?.cartId === cartId ? { ...item, quantity: newQuantity } : item
      ));
    }
  }, []);

  const handleRemoveItem = useCallback((cartId) => {
    setCartItems(prev => prev?.filter(item => item?.cartId !== cartId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const handleProceedToPayment = useCallback(() => {
    if (cartItems?.length === 0) return;
    const orderData = {
      items: cartItems,
      total: cartTotal,
      tax: cartTotal * 0.16,
      grandTotal: cartTotal * 1.16,
      cashier: currentUser,
      timestamp: new Date()?.toISOString()
    };
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    navigate('/payment-processing-and-checkout');
  }, [cartItems, cartTotal, currentUser, navigate]);

  const handleQuickReorder = useCallback((order) => {
    console.log('Quick reorder:', order);
  }, []);

  const handleBarcodeMode = useCallback(() => {
    setBarcodeMode(prev => !prev);
  }, []);

  const handleCustomerPreferences = useCallback(() => {
    console.log('Opening customer preferences');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('currentUser');
    navigate('/staff-login-and-authentication');
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastSync: new Date()?.toISOString()
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault();
            setBarcodeMode(prev => !prev);
            break;
          case 'c':
            event.preventDefault();
            setCartItems([]);
            break;
          case 'p':
            event.preventDefault();
            if (cartItems?.length > 0) {
              handleProceedToPayment();
            }
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cartItems, handleProceedToPayment]);

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} onLogout={handleLogout} />
      <div className="pt-16 h-screen flex">
        {/* Left Panel - Product Grid (now wider) */}
        <div className="w-full lg:w-3/4 flex flex-col">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            onProductSelect={handleProductSelect}
          />
        </div>
        {/* Right Panel - System Status + Current Order */}
        <div className="hidden lg:flex lg:w-1/4 flex-col gap-4 px-2">
          <div className="mb-2">
            <StatusIndicators
              mpesaStatus={systemStatus?.mpesa}
              firestoreStatus={systemStatus?.firestore}
              lastSync={systemStatus?.lastSync}
            />
          </div>
          <div className="mb-2">
            <QuickActions
              onQuickReorder={handleQuickReorder}
              onBarcodeMode={handleBarcodeMode}
              onCustomerPreferences={handleCustomerPreferences}
              recentOrders={recentOrders}
              barcodeMode={barcodeMode}
            />
          </div>
          <CartPanel
            cartItems={cartItems}
            cartTotal={cartTotal}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onProceedToPayment={handleProceedToPayment}
            currentUser={currentUser}
          />
        </div>
      </div>
      {/* Size Selection Modal */}
      <SizeSelectionModal
        product={selectedProduct}
        isOpen={showSizeModal}
        onClose={() => {
          setShowSizeModal(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />
      {/* Barcode Scanner Overlay */}
      {barcodeMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-custom z-40 flex items-center justify-center">
          <div className="bg-card rounded-lg p-8 text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Scan" size={32} className="text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Barcode Scanner Active
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Scan product barcode or press Escape to exit
            </p>
            <Button
              variant="outline"
              onClick={() => setBarcodeMode(false)}
              iconName="X"
              iconPosition="left"
              iconSize={16}
            >
              Exit Scanner
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSaleOrderProcessing;