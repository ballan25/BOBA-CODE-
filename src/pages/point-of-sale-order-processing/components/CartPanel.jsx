import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CartPanel = ({ 
  cartItems, 
  cartTotal, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onProceedToPayment,
  currentUser 
}) => {
  const formatPrice = (price) => {
    return `KES ${price?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const getTotalItems = () => {
    return cartItems?.reduce((total, item) => total + item?.quantity, 0);
  };

  return (
    <div className="w-full lg:w-2/5 bg-card border-l border-border flex flex-col">
      {/* Cart Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">
            Current Order
          </h2>
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
              {getTotalItems()} items
            </div>
            {cartItems?.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearCart}
                iconName="Trash2"
                iconSize={16}
                className="text-error hover:text-error hover:bg-error/10 touch-feedback"
                title="Clear cart"
              />
            )}
          </div>
        </div>
        
        {currentUser && (
          <div className="text-xs text-muted-foreground">
            Cashier: {currentUser?.name} | ID: {currentUser?.id}
          </div>
        )}
      </div>
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cartItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Icon name="ShoppingCart" size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Cart is Empty
            </h3>
            <p className="text-sm text-muted-foreground">
              Add items from the menu to start an order
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {cartItems?.map((item) => (
              <div key={item?.cartId} className="bg-muted/50 rounded-lg p-3 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {item?.name}
                    </h4>
                    {item?.size && (
                      <p className="text-xs text-muted-foreground">
                        Size: {item?.size}
                      </p>
                    )}
                    {item?.toppings && item?.toppings?.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Toppings: {item?.toppings?.join(', ')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item?.cartId)}
                    iconName="X"
                    iconSize={14}
                    className="text-error hover:text-error hover:bg-error/10 touch-feedback flex-shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item?.cartId, item?.quantity - 1)}
                      disabled={item?.quantity <= 1}
                      iconName="Minus"
                      iconSize={14}
                      className="w-8 h-8 touch-feedback"
                    />
                    <span className="w-8 text-center text-sm font-medium text-foreground">
                      {item?.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item?.cartId, item?.quantity + 1)}
                      iconName="Plus"
                      iconSize={14}
                      className="w-8 h-8 touch-feedback"
                    />
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {formatPrice(item?.price * item?.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Cart Footer */}
      {cartItems?.length > 0 && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-foreground">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (16%):</span>
              <span className="text-foreground">{formatPrice(cartTotal * 0.16)}</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">{formatPrice(cartTotal * 1.16)}</span>
              </div>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={onProceedToPayment}
            iconName="CreditCard"
            iconPosition="left"
            iconSize={18}
            className="w-full touch-feedback"
          >
            Proceed to Payment
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPanel;