import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function Checkout() {
  const { user, token } = useAuth();
  const { cart: cartItems, clearCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.username || '',
    phone: '',
    address: '',
    payment: 'COD'
  });
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * (item.qty ?? item.quantity ?? 1),
    0
  );

  // -------------------------------
  // Form Validation
  // -------------------------------
  const validateForm = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast.error('Please fill all required fields');
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      toast.error('Enter a valid 10-digit phone number');
      return false;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return false;
    }
    return true;
  };

  // -------------------------------
  // Place Order (Unified for COD & Online)
  // -------------------------------
  const placeOrder = async (paymentMethod, paymentId = null) => {
    if (!token) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          menu_item: item.id,
          quantity: item.qty ?? item.quantity ?? 1
        })),
        ...(paymentId && { payment_id: paymentId })
      };

      const response = await api.post('orders/', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearCart();
      toast.success(`Order #${response.data.id} placed successfully!`);
      navigate('/orders', { state: { newOrder: response.data, showSuccess: true } });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Order creation failed');
      console.error('Order error:', error);
    } finally {
      setLoading(false);
      setPaymentLoading(false);
    }
  };

  // -------------------------------
  // COD Handler
  // -------------------------------
  const handleCOD = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await placeOrder('COD');
  };

  // -------------------------------
  // Razorpay / Online Payment Handler
  // -------------------------------
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setPaymentLoading(true);

    try {
      // 1. Create Razorpay order via backend
      const paymentResponse = await api.post('orders/payment/', {
        amount: total * 100, // Paise
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone
      });

      const options = paymentResponse.data;

      // 2. Open Razorpay Checkout
      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.success', async (response) => {
        toast.success('Payment successful! Creating order...');
        await placeOrder('ONLINE', response.razorpay_payment_id);
      });

      razorpay.on('payment.failed', () => {
        toast.error('Payment failed!');
        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Payment failed');
      setPaymentLoading(false);
    }
  };

  // -------------------------------
  // Render Component
  // -------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4">
            Checkout
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Review your order and choose payment method
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Order Summary */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8">
              {cartItems.map(item => {
                const qty = item.qty ?? item.quantity ?? 1;
                return (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                        <span className="text-xl font-bold text-purple-600">{qty}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">₹{item.price} each</p>
                      </div>
                    </div>
                    <p className="font-bold text-xl text-purple-600">₹{(item.price * qty).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
              <div className="flex justify-between text-2xl font-bold mb-2">
                <span>Total:</span>
                <span className="text-purple-600">₹{total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-purple-600 text-right font-semibold">
                Free delivery • Order above ₹200
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Payment Details</h2>
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      required
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                    <input
                      required
                      type="tel"
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address *</label>
                  <textarea
                    required
                    rows="4"
                    value={customerInfo.address}
                    onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-vertical"
                    placeholder="House no, Street, Area, City, PIN code"
                  />
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-6">Choose Payment Method</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setCustomerInfo(prev => ({...prev, payment: 'COD'}))}
                      className={`group p-6 rounded-3xl border-4 font-semibold text-left transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                        customerInfo.payment === 'COD'
                          ? 'border-green-500 bg-green-50 shadow-green-200'
                          : 'border-gray-200 hover:border-green-400 bg-white/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4 mb-3">
                        <div className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all ${
                          customerInfo.payment === 'COD' ? 'bg-green-500 text-white shadow-lg' : 'bg-green-100 text-green-600'
                        }`}>
                          💰
                        </div>
                        <div className={`w-3 h-3 rounded-full border-4 transition-all ${
                          customerInfo.payment === 'COD' ? 'border-green-500' : 'border-transparent'
                        }`}></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">Cash on Delivery</h3>
                      <p className="text-gray-600 text-sm">Pay when your order is delivered</p>
                    </button>

                    {/* Online */}
                    <button
                      type="button"
                      onClick={() => setCustomerInfo(prev => ({...prev, payment: 'ONLINE'}))}
                      className={`group p-6 rounded-3xl border-4 font-semibold text-left transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                        customerInfo.payment === 'ONLINE'
                          ? 'border-purple-500 bg-purple-50 shadow-purple-200'
                          : 'border-gray-200 hover:border-purple-400 bg-white/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4 mb-3">
                        <div className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all ${
                          customerInfo.payment === 'ONLINE' ? 'bg-purple-500 text-white shadow-lg' : 'bg-purple-100 text-purple-600'
                        }`}>
                          💳
                        </div>
                        <div className={`w-3 h-3 rounded-full border-4 transition-all ${
                          customerInfo.payment === 'ONLINE' ? 'border-purple-500' : 'border-transparent'
                        }`}></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">Pay Online (UPI/Cards)</h3>
                      <p className="text-gray-600 text-sm">Secure payment via Razorpay</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Place Order Buttons */}
              <div className="pt-8 space-y-4">
                {customerInfo.payment === 'COD' && (
                  <button
                    onClick={handleCOD}
                    disabled={loading || cartItems.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-5 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-2xl animate-spin"></div>
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>🚚</span>
                        <span>Place COD Order - ₹{total.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                )}

                {customerInfo.payment === 'ONLINE' && (
                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading || cartItems.length === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-5 px-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-2xl animate-spin"></div>
                        <span>Opening Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>💳</span>
                        <span>Pay ₹{total.toFixed(2)} Securely</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}