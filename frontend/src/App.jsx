import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import CustomerHome from "./pages/customer/CustomerHome";
import CustomerDashboard from "./pages/customer/CustomerDashboard";

import SellerHome from "./pages/seller/SellerHome";
import SellerDashboard from "./pages/seller/SellerDashboard";

import Cart from "./pages/checkout/Cart";
import Checkout from "./pages/checkout/Checkout";
import PaymentProcessing from "./pages/checkout/PaymentProcessing";
import Receipt from "./pages/checkout/Receipt";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* ---------------- PUBLIC ---------------- */}

                <Route
                    path="/"
                    element={
                        <Layout>
                            <Home />
                        </Layout>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Layout>
                            <Login />
                        </Layout>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <Layout>
                            <Register />
                        </Layout>
                    }
                />

                {/* ---------------- PROFILE ---------------- */}

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Profile />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* ---------------- CUSTOMER ---------------- */}

                <Route
                    path="/customer/home"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <CustomerHome />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/dashboard"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <CustomerDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/cart"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <Cart />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* ---------------- PAYMENT ---------------- */}

                <Route
                    path="/checkout/payment"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <Checkout />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/checkout/processing"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <PaymentProcessing />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/checkout/receipt"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <Receipt />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* ---------------- SELLER ---------------- */}

                <Route
                    path="/seller/home"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <SellerHome />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/seller/dashboard"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <SellerDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* ---------------- 404 ---------------- */}

                <Route
                    path="*"
                    element={
                        <Layout>
                            <NotFound />
                        </Layout>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;