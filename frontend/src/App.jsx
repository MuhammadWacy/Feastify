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
import OrderTracking from "./pages/customer/OrderTracking";
import NewNegotiation from "./pages/customer/NewNegotiation";
import CustomerNegotiations from "./pages/customer/CustomerNegotiations";
import AIAssistant from "./pages/customer/AIAssistant";
import Favorites from "./pages/customer/Favorites";
import CatererProfile from "./pages/customer/CatererProfile";
import CustomerNeeds from "./pages/customer/CustomerNeeds";
import FiledComplaints from "./pages/customer/FiledComplaints";
import CustomerBookingHistory from "./pages/customer/CustomerBookingHistory";

import SellerHome from "./pages/seller/SellerHome";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerListing from "./pages/seller/SellerListing";
import SellerNegotiations from "./pages/seller/SellerNegotiations";
import DeliveryVerification from "./pages/seller/DeliveryVerification";
import SellerFaqs from "./pages/seller/SellerFaqs";
import SellerNeedDetails from "./pages/seller/SellerNeedDetails";
import SellerSpecialOffers from "./pages/seller/SellerSpecialOffers";
import SellerComplaints from "./pages/seller/SellerComplaints";
import SellerBookingHistory from "./pages/seller/SellerBookingHistory";

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
                    path="/customer/negotiations/new"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <NewNegotiation />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/negotiations"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <CustomerNegotiations />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/assistant"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <AIAssistant />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/favorites"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <Favorites />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/caterers/:cateringId"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <CatererProfile />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/needs"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <CustomerNeeds />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/customer/history"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <CustomerBookingHistory />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/customer/complaints"
                    element={
                        <ProtectedRoute allowedRole="customer">
                            <Layout>
                                <FiledComplaints />
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

                <Route
                    path="/seller/needs/:needId"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <SellerNeedDetails />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/seller/negotiations"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <SellerNegotiations />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/seller/listing"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <SellerListing />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/seller/deliveries"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <DeliveryVerification />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/seller/special-offers"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <SellerSpecialOffers />
                            </Layout>
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/seller/history"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <SellerBookingHistory />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/seller/complaints"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <SellerComplaints />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/seller/faqs"
                    element={
                        <ProtectedRoute allowedRole="seller">
                            <Layout>
                                <SellerFaqs />
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