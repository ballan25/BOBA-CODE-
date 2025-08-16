import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PointOfSaleOrderProcessing from "./pages/point-of-sale-order-processing";
import PaymentProcessingAndCheckout from "./pages/payment-processing-and-checkout";
// Add other imports as needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PointOfSaleOrderProcessing />} />
        <Route path="/payment-processing-and-checkout" element={<PaymentProcessingAndCheckout />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
