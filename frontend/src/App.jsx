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

import NegotiationCustomer from './pages/customer/NegotiationCustomer';
import NegotiationCaterer from './pages/seller/NegotiationCaterer';
import SellerNegotiationHub from './pages/seller/SellerNegotiationHub';

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

                {/* Negotiation Routes */}
                <Route 
                   path="/negotiate" 
                   element={
                       <Layout>
                           <NegotiationCustomer />
                       </Layout>
                   } 
                />

                <Route 
                   path="/seller/negotiate/:id" 
                   element={
                       <Layout>
                           <NegotiationCaterer />
                       </Layout>
                   } 
                />

                <Route 
                   path="/seller/negotiations" 
                   element={
                       <Layout>
                           <SellerNegotiationHub />
                       </Layout>
                   } 
                />

                {/* 404 Catch-All */}
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