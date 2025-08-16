import React from 'react';
import Button from '../../../components/ui/Button';

const ProductGrid = ({ products, onAddToCart, onProductSelect }) => {
  const formatPrice = (price) => {
    return `KES ${price?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  // Dark green button styling with better sizing
  const greenClass = "border-green-700 bg-green-700 text-white font-medium rounded-md transition-colors hover:bg-green-800 hover:border-green-800 px-4 py-2.5 text-sm";

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product) => (
          <div
            key={product?.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between p-6 min-h-[220px] w-full"
          >
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold text-lg text-gray-900 mb-3 text-center break-words leading-tight">
                {product?.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 text-center break-words flex-1">
                {product?.description}
              </p>
              {product?.sizes && (
                <div className="mb-4 w-full text-sm text-gray-700 text-center space-y-1">
                  {product.sizes.map(size => (
                    <div key={size.id} className="font-medium">
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
                  size="md"
                  onClick={() => onProductSelect(product)}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={16}
                  className={`w-full ${greenClass} min-h-[48px] flex items-center justify-center gap-2 font-medium`}
                >
                  Select Size
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="md"
                  onClick={() => onAddToCart(product)}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={16}
                  className={`w-full ${greenClass} min-h-[48px] flex items-center justify-center gap-2 font-medium`}
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
