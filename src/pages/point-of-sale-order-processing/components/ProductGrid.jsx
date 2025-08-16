import React from 'react';
import Button from '../../../components/ui/Button';

const ProductGrid = ({ products, onAddToCart, onProductSelect }) => {
  const formatPrice = (price) => {
    return `KES ${price?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  // Fixed green class with proper padding and sizing
  const greenClass = "border-green-700 bg-green-700 text-white font-semibold rounded transition-colors hover:bg-green-800 hover:border-green-800 px-4 py-3";

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {products?.map((product) => (
          <div
            key={product?.id}
            className="bg-card border border-border rounded-lg shadow-elevation-1 transition-all duration-200 hover:shadow-elevation-2 flex flex-col justify-between p-6 min-h-[200px] w-full"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-base text-foreground mb-3 text-center break-words">
                {product?.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3 text-center break-words">
                {product?.description}
              </p>
              {product?.sizes && (
                <div className="mb-3 w-full text-xs text-muted-foreground text-center">
                  {product.sizes.map(size => (
                    <div key={size.id} className="mb-1">
                      {size.name}: {formatPrice(size.price)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-auto">
              {product?.sizes ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onProductSelect(product)}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={14}
                  className={`w-full mt-2 border-2 ${greenClass} min-h-[44px] flex items-center justify-center text-sm`}
                >
                  Select Size
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAddToCart(product)}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={14}
                  className={`w-full mt-2 border-2 ${greenClass} min-h-[44px] flex items-center justify-center text-sm`}
                >
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
