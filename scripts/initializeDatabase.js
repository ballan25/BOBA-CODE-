// scripts/initializeDatabase.js
import { ProductService, AnalyticsService, checkDatabaseHealth } from '../src/services/database';
import { format, subDays } from 'date-fns';

// Sample products data to migrate from hardcoded data
const SAMPLE_PRODUCTS = [
  {
    name: 'Taro Milk Tea',
    price: 4.50,
    category: 'Milk Tea',
    image: '/assets/images/taro milk tea.jpg',
    stock: 100,
    description: 'Creamy taro milk tea with pearls',
    isActive: true
  },
  {
    name: 'Strawberry Milk Tea',
    price: 4.75,
    category: 'Milk Tea',
    image: '/assets/images/strawberry milk tea.jpg',
    stock: 85,
    description: 'Fresh strawberry milk tea with real strawberry pieces',
    isActive: true
  },
  {
    name: 'Blueberry Milkshake',
    price: 5.25,
    category: 'Milkshake',
    image: '/assets/images/blueberry milkshake.jpg',
    stock: 60,
    description: 'Rich and creamy blueberry milkshake',
    isActive: true
  },
  {
    name: 'Classic Bubble Tea',
    price: 4.00,
    category: 'Bubble Tea',
    image: '/assets/images/no_image.png',
    stock: 120,
    description: 'Traditional bubble tea with tapioca pearls',
    isActive: true
  },
  {
    name: 'Mango Smoothie',
    price: 4.95,
    category: 'Smoothie',
    image: '/assets/images/no_image.png',
    stock: 75,
    description: 'Fresh mango smoothie with real fruit',
    isActive: true
  },
  {
    name: 'Green Tea Latte',
    price: 4.25,
    category: 'Tea',
    image: '/assets/images/no_image.png',
    stock: 90,
    description: 'Matcha green tea latte with steamed milk',
    isActive: true
  },
  {
    name: 'Chocolate Milkshake',
    price: 4.75,
    category: 'Milkshake',
    image: '/assets/images/no_image.png',
    stock: 65,
    description: 'Rich chocolate milkshake with whipped cream',
    isActive: true
  },
  {
    name: 'Passion Fruit Tea',
    price: 4.50,
    category: 'Fruit Tea',
    image: '/assets/images/no_image.png',
    stock: 80,
    description: 'Refreshing passion fruit tea with real fruit pieces',
    isActive: true
  }
];

// Sample transaction data for testing
const generateSampleTransactions = async (products, days = 30) => {
  const transactions = [];
  const paymentMethods = ['cash', 'mpesa', 'card'];
  
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i);
    const dailyTransactions = Math.floor(Math.random() * 50) + 10; // 10-60 transactions per day
    
    for (let j = 0; j < dailyTransactions; j++) {
      // Random time throughout the day
      const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
      const minutes = Math.floor(Math.random() * 60);
      const transactionDate = new Date(date);
      transactionDate.setHours(hours, minutes, 0, 0);
      
      // Random number of items (1-4)
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let subtotal = 0;
      
      for (let k = 0; k < itemCount; k++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        const itemSubtotal = product.price * quantity;
        
        items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          subtotal: itemSubtotal
        });
        
        subtotal += itemSubtotal;
      }
      
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      
      transactions.push({
        items,
        subtotal,
        tax,
        total,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        cashierId: `cashier-${Math.floor(Math.random() * 3) + 1}`,
        status: 'completed',
        timestamp: transactionDate,
        createdAt: transactionDate
      });
    }
  }
  
  return transactions;
};

// Main initialization function
export async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // 1. Check database health
    console.log('📊 Checking database connection...');
    const healthCheck = await checkDatabaseHealth();
    
    if (healthCheck.status !== 'healthy') {
      throw new Error(`Database health check failed: ${healthCheck.error}`);
    }
    
    console.log('✅ Database connection successful!');
    
    // 2. Check if products already exist
    console.log('🔍 Checking existing products...');
    const existingProducts = await ProductService.getProducts();
    
    if (existingProducts.length > 0) {
      console.log(`📦 Found ${existingProducts.length} existing products`);
      console.log('⚠️  Skipping product creation (products already exist)');
    } else {
      // 3. Create sample products
      console.log('📦 Creating sample products...');
      const createdProducts = [];
      
      for (const productData of SAMPLE_PRODUCTS) {
        try {
          const product = await ProductService.createProduct(productData);
          createdProducts.push(product);
          console.log(`   ✓ Created: ${product.name}`);
        } catch (error) {
          console.error(`   ❌ Failed to create ${productData.name}:`, error.message);
        }
      }
      
      console.log(`✅ Created ${createdProducts.length}/${SAMPLE_PRODUCTS.length} products`);
    }
    
    // 4. Get all products for transaction generation
    const allProducts = await ProductService.getProducts();
    
    // 5. Generate sample transactions (optional - for demo purposes)
    const shouldGenerateTransactions = confirm(
      'Do you want to generate sample transaction data for the last 30 days? (This is for demo purposes only)'
    );
    
    if (shouldGenerateTransactions) {
      console.log('💳 Generating sample transactions...');
      // Note: You would implement TransactionService.createTransaction in batch here
      // For now, we'll just log the intent
      const sampleTransactions = await generateSampleTransactions(allProducts, 30);
      console.log(`📊 Generated ${sampleTransactions.length} sample transactions`);
      
      // In a real implementation, you would batch create these transactions
      // await TransactionService.batchCreateTransactions(sampleTransactions);
    }
    
    // 6. Verify initialization
    console.log('🔍 Verifying initialization...');
    const finalProductCount = await ProductService.getProducts();
    console.log(`📦 Total products in database: ${finalProductCount.length}`);
    
    console.log('🎉 Database initialization completed successfully!');
    
    return {
      success: true,
      products: finalProductCount.length,
      message: 'Database initialized successfully'
    };
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Database initialization failed'
    };
  }
}

// Function to reset database (use with caution)
export async function resetDatabase() {
  const confirmReset = confirm(
    'WARNING: This will delete all data in the database. This action cannot be undone. Are you sure?'
  );
  
  if (!confirmReset) {
    console.log('Database reset cancelled');
    return { success: false, message: 'Reset cancelled' };
  }
  
  try {
    console.log('🗑️  Starting database reset...');
    
    // Note: Firestore doesn't have a built-in way to delete all documents
    // You would need to implement batch deletion for each collection
    // This is left as an exercise for production implementation
    
    console.log('⚠️  Database reset not implemented (for safety)');
    console.log('   To reset manually:');
    console.log('   1. Go to Firebase Console');
    console.log('   2. Navigate to Firestore Database');
    console.log('   3. Delete collections manually');
    
    return {
      success: false,
      message: 'Reset not implemented - use Firebase Console for manual reset'
    };
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Database reset failed'
    };
  }
}

// Function to migrate from hardcoded data (if you have it in your current app)
export async function migrateFromHardcodedData(hardcodedData) {
  console.log('🔄 Starting migration from hardcoded data...');
  
  try {
    let migratedItems = 0;
    
    // Migrate products
    if (hardcodedData.products) {
      for (const productData of hardcodedData.products) {
        await ProductService.createProduct(productData);
        migratedItems++;
        console.log(`   ✓ Migrated product: ${productData.name}`);
      }
    }
    
    // Migrate transactions (if any)
    if (hardcodedData.transactions) {
      // Implement transaction migration here
      console.log(`   📊 Found ${hardcodedData.transactions.length} transactions to migrate`);
      // This would require implementing batch transaction creation
    }
    
    console.log(`✅ Migration completed! Migrated ${migratedItems} items`);
    
    return {
      success: true,
      migratedItems,
      message: 'Migration completed successfully'
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Migration failed'
    };
  }
}

// Export for use in React components
export default {
  initializeDatabase,
  resetDatabase,
  migrateFromHardcodedData
};

// If running as a script
if (typeof window === 'undefined') {
  // Node.js environment
  initializeDatabase().then((result) => {
    if (result.success) {
      console.log('✅ Initialization completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Initialization failed');
      process.exit(1);
    }
  });
}
