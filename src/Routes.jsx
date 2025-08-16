import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import NotFound from "./pages/NotFound.jsx";
import ReceiptGenerationAndManagement from './pages/receipt-generation-and-management/index.jsx';
import StaffLoginAndAuthentication from './pages/staff-login-and-authentication/index.jsx';
import PaymentProcessingAndCheckout from './pages/payment-processing-and-checkout/index.jsx';
import PointOfSaleOrderProcessing from './pages/point-of-sale-order-processing/index.jsx';
import AdminSalesDashboardAndAnalytics from './pages/admin-sales-dashboard-and-analytics/index.jsx';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* POS menu is now the default route */}
          <Route path="/" element={<PointOfSaleOrderProcessing />} />
          <Route path="/receipt-generation-and-management" element={<ReceiptGenerationAndManagement />} />
          <Route path="/staff-login-and-authentication" element={<StaffLoginAndAuthentication />} />
          <Route path="/payment-processing-and-checkout" element={<PaymentProcessingAndCheckout />} />
          <Route path="/point-of-sale-order-processing" element={<PointOfSaleOrderProcessing />} />
          <Route path="/admin-sales-dashboard-and-analytics" element={<AdminSalesDashboardAndAnalytics />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
