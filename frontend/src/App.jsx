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
import Caterers from "./pages/customer/Caterers";
import ServiceDetail from "./pages/customer/ServiceDetail";
import RequestSuccess from "./pages/customer/RequestSuccess";
import OrderTracking from "./pages/customer/OrderTracking";

import SellerHome from "./pages/seller/SellerHome";
import SellerDashboard from "./pages/seller/SellerDashboard";
import OrdersDashboard from "./pages/seller/OrdersDashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}

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

                {/* Profile */}

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

                {/* Customer */}

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
                    path="/customer/caterers"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <Caterers />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/caterers/:id"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <ServiceDetail />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/request-success"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <RequestSuccess />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/orders"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <OrderTracking />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/orders/:id"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <OrderTracking />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Seller */}

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

                <Route
                    path="/seller/orders"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <OrdersDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/seller/orders/:id"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <OrdersDashboard />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}

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