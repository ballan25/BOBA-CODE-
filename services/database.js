// src/services/database.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

// ============ TRANSACTION SERVICES ============

export class TransactionService {
  static collectionName = 'transactions';

  // Create a new transaction
  static async createTransaction(transactionData) {
    try {
      const transaction = {
        ...transactionData,
        id: null, // Will be set by Firestore
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: transactionData.status || 'completed',
        receiptNumber: await this.generateReceiptNumber()
      };

      const docRef = await addDoc(collection(db, this.collectionName), transaction);
      
      // Update analytics after successful transaction
      await AnalyticsService.updateDailySales(transactionData);
      
      return { id: docRef.id, ...transaction };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }
  }

  // Get transaction by ID
  static async getTransaction(id) {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw new Error('Failed to get transaction');
    }
  }

  // Get transactions with pagination and filters
  static async getTransactions({
    page = 1,
    pageSize = 20,
    startDate = null,
    endDate = null,
    cashierId = null,
    paymentMethod = null,
    status = null
  } = {}) {
    try {
      let q = collection(db, this.collectionName);
      const conditions = [];

      // Apply filters
      if (startDate && endDate) {
        conditions.push(where('createdAt', '>=', startDate));
        conditions.push(where('createdAt', '<=', endDate));
      }
      
      if (cashierId) {
        conditions.push(where('cashierId', '==', cashierId));
      }
      
      if (paymentMethod) {
        conditions.push(where('paymentMethod', '==', paymentMethod));
      }
      
      if (status) {
        conditions.push(where('status', '==', status));
      }

      // Build query
      q = query(
        q,
        ...conditions,
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });

      return {
        transactions,
        hasMore: querySnapshot.size === pageSize,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error('Failed to get transactions');
    }
  }

  // Generate unique receipt number
  static async generateReceiptNumber() {
    const today = new Date();
    const dateString = format(today, 'yyyyMMdd');
    const timestamp = Date.now().toString().slice(-6);
    return `RCP-${dateString}-${timestamp}`;
  }

  // Get transactions real-time listener
  static subscribeToTransactions(callback, filters = {}) {
    let q = collection(db, this.collectionName);
    const conditions = [];

    // Apply filters (similar to getTransactions)
    if (filters.startDate && filters.endDate) {
      conditions.push(where('createdAt', '>=', filters.startDate));
      conditions.push(where('createdAt', '<=', filters.endDate));
    }

    q = query(
      q,
      ...conditions,
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (querySnapshot) => {
      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      callback(transactions);
    });
  }
}

// ============ PRODUCT SERVICES ============

export class ProductService {
  static collectionName = 'products';

  // Create a new product
  static async createProduct(productData) {
    try {
      const product = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        stock: productData.stock || 0
      };

      const docRef = await addDoc(collection(db, this.collectionName), product);
      return { id: docRef.id, ...product };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  // Get all products
  static async getProducts({ category = null, isActive = true } = {}) {
    try {
      let q = collection(db, this.collectionName);
      const conditions = [];

      if (category) {
        conditions.push(where('category', '==', category));
      }
      
      if (isActive !== null) {
        conditions.push(where('isActive', '==', isActive));
      }

      q = query(q, ...conditions, orderBy('name'));

      const querySnapshot = await getDocs(q);
      const products = [];
      
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });

      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Failed to get products');
    }
  }

  // Update product
  static async updateProduct(id, updates) {
    try {
      const productRef = doc(db, this.collectionName, id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  // Update product stock
  static async updateStock(productId, quantity, operation = 'decrement') {
    try {
      const productRef = doc(db, this.collectionName, productId);
      const incrementValue = operation === 'increment' ? quantity : -quantity;
      
      await updateDoc(productRef, {
        stock: increment(incrementValue),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error('Failed to update stock');
    }
  }

  // Batch update stock for multiple products (useful for transactions)
  static async batchUpdateStock(items) {
    try {
      const batch = writeBatch(db);

      items.forEach(item => {
        const productRef = doc(db, this.collectionName, item.productId);
        batch.update(productRef, {
          stock: increment(-item.quantity),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error batch updating stock:', error);
      throw new Error('Failed to update stock');
    }
  }
}

// ============ ANALYTICS SERVICES ============

export class AnalyticsService {
  static collectionName = 'analytics';

  // Update daily sales analytics
  static async updateDailySales(transactionData) {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const analyticsRef = doc(db, this.collectionName, `daily-${today}`);
      
      const docSnap = await getDoc(analyticsRef);
      
      if (docSnap.exists()) {
        // Update existing analytics
        const currentData = docSnap.data();
        const updates = {
          totalSales: increment(transactionData.total),
          transactionCount: increment(1),
          updatedAt: serverTimestamp()
        };

        // Update payment method stats
        const paymentMethodKey = `paymentMethods.${transactionData.paymentMethod}`;
        updates[paymentMethodKey] = increment(transactionData.total);

        await updateDoc(analyticsRef, updates);
      } else {
        // Create new daily analytics
        const newAnalytics = {
          date: today,
          totalSales: transactionData.total,
          transactionCount: 1,
          paymentMethods: {
            [transactionData.paymentMethod]: transactionData.total
          },
          topProducts: {},
          peakHours: {},
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await updateDoc(analyticsRef, newAnalytics, { merge: true });
      }

      // Update hourly peak analysis
      await this.updatePeakHours(today, new Date().getHours());
      
    } catch (error) {
      console.error('Error updating daily sales:', error);
      throw new Error('Failed to update analytics');
    }
  }

  // Update peak hours
  static async updatePeakHours(date, hour) {
    try {
      const analyticsRef = doc(db, this.collectionName, `daily-${date}`);
      const hourKey = `peakHours.${hour}`;
      
      await updateDoc(analyticsRef, {
        [hourKey]: increment(1)
      }, { merge: true });
    } catch (error) {
      console.error('Error updating peak hours:', error);
    }
  }

  // Get analytics for date range
  static async getAnalytics(startDate, endDate) {
    try {
      const analytics = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Generate date range
      for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        const dateString = format(date, 'yyyy-MM-dd');
        const docRef = doc(db, this.collectionName, `daily-${dateString}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          analytics.push({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Create empty analytics for missing dates
          analytics.push({
            date: dateString,
            totalSales: 0,
            transactionCount: 0,
            paymentMethods: {},
            topProducts: {},
            peakHours: {}
          });
        }
      }
      
      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  // Get dashboard KPIs
  static async getDashboardKPIs() {
    try {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const startOfThisMonth = startOfMonth(today);
      
      // Get today's analytics
      const todayAnalytics = await this.getAnalytics(today, today);
      const yesterdayAnalytics = await this.getAnalytics(yesterday, yesterday);
      const monthAnalytics = await this.getAnalytics(startOfThisMonth, today);
      
      // Calculate KPIs
      const todaySales = todayAnalytics[0]?.totalSales || 0;
      const yesterdaySales = yesterdayAnalytics[0]?.totalSales || 0;
      const monthSales = monthAnalytics.reduce((sum, day) => sum + (day.totalSales || 0), 0);
      const monthTransactions = monthAnalytics.reduce((sum, day) => sum + (day.transactionCount || 0), 0);
      
      return {
        todaySales,
        yesterdaySales,
        monthSales,
        monthTransactions,
        salesGrowth: yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales * 100) : 0,
        averageOrderValue: monthTransactions > 0 ? monthSales / monthTransactions : 0
      };
    } catch (error) {
      console.error('Error getting dashboard KPIs:', error);
      throw new Error('Failed to get dashboard KPIs');
    }
  }
}

// ============ REPORTS SERVICES ============

export class ReportService {
  static collectionName = 'reports';

  // Save a custom report
  static async saveReport(reportData) {
    try {
      const report = {
        ...reportData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), report);
      return { id: docRef.id, ...report };
    } catch (error) {
      console.error('Error saving report:', error);
      throw new Error('Failed to save report');
    }
  }

  // Get saved reports
  static async getSavedReports() {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
      });

      return reports;
    } catch (error) {
      console.error('Error getting saved reports:', error);
      throw new Error('Failed to get saved reports');
    }
  }

  // Delete a saved report
  static async deleteReport(reportId) {
    try {
      await deleteDoc(doc(db, this.collectionName, reportId));
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw new Error('Failed to delete report');
    }
  }

  // Generate sales report
  static async generateSalesReport(startDate, endDate, filters = {}) {
    try {
      // Get transactions for the period
      const { transactions } = await TransactionService.getTransactions({
        startDate: startOfDay(new Date(startDate)),
        endDate: endOfDay(new Date(endDate)),
        ...filters
      });

      // Get analytics for the period
      const analytics = await AnalyticsService.getAnalytics(startDate, endDate);

      // Calculate report metrics
      const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
      const totalTransactions = transactions.length;
      const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      // Group by payment method
      const paymentMethodBreakdown = transactions.reduce((acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.total;
        return acc;
      }, {});

      // Top selling products
      const productSales = {};
      transactions.forEach(t => {
        t.items.forEach(item => {
          if (!productSales[item.name]) {
            productSales[item.name] = { quantity: 0, revenue: 0 };
          }
          productSales[item.name].quantity += item.quantity;
          productSales[item.name].revenue += item.price * item.quantity;
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return {
        period: { startDate, endDate },
        summary: {
          totalSales,
          totalTransactions,
          averageOrderValue
        },
        paymentMethodBreakdown,
        topProducts,
        transactions,
        analytics
      };
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw new Error('Failed to generate sales report');
    }
  }
}

// ============ UTILITY FUNCTIONS ============

// Initialize database with sample data (for development)
export async function initializeSampleData() {
  try {
    // Sample products
    const sampleProducts = [
      {
        name: 'Taro Milk Tea',
        price: 4.50,
        category: 'Milk Tea',
        image: '/assets/images/taro milk tea.jpg',
        stock: 100,
        description: 'Creamy taro milk tea with pearls'
      },
      {
        name: 'Strawberry Milk Tea',
        price: 4.75,
        category: 'Milk Tea',
        image: '/assets/images/strawberry milk tea.jpg',
        stock: 85,
        description: 'Fresh strawberry milk tea'
      },
      {
        name: 'Blueberry Milkshake',
        price: 5.25,
        category: 'Milkshake',
        image: '/assets/images/blueberry milkshake.jpg',
        stock: 60,
        description: 'Rich blueberry milkshake'
      }
    ];

    // Create products
    for (const product of sampleProducts) {
      await ProductService.createProduct(product);
    }

    console.log('Sample data initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return false;
  }
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    // Try to read from each collection
    const productsQuery = query(collection(db, 'products'), limit(1));
    const transactionsQuery = query(collection(db, 'transactions'), limit(1));
    
    await getDocs(productsQuery);
    await getDocs(transactionsQuery);
    
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy', error: error.message, timestamp: new Date() };
  }
}
