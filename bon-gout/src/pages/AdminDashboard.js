import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      toast.error("Unauthorized access!");
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [isLoggedIn, isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await api.get('orders/');
      const data = response.data.data?.results || response.data.data;
      
      if (Array.isArray(data)) {
        setOrders(data);
        
        const totals = data.reduce((acc, order) => {
          acc.totalSales += parseFloat(order.total_amount || 0);
          if (order.status === 'pending') acc.pendingOrders++;
          if (order.status === 'delivered') acc.deliveredOrders++;
          return acc;
        }, { totalSales: 0, pendingOrders: 0, deliveredOrders: 0 });

        setStats({
          totalOrders: data.length,
          ...totals
        });
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const advanceStatus = async (orderId) => {
    try {
      const response = await api.post(`orders/${orderId}/update_progress/`);
      toast.success(response.data.message || "Status updated!");
      fetchAdminData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update status";
      toast.error(errorMsg);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await api.post(`orders/${orderId}/cancel/`);
      toast.success(response.data.message || "Order cancelled");
      fetchAdminData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to cancel order";
      toast.error(errorMsg);
    }
  };

  if (loading) return <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-gray-900 dark:text-white text-2xl font-black transition-colors duration-300">🛡️ Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pt-24 pb-12 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">🛡️ Admin Dashboard</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => window.open('http://127.0.0.1:8000/admin/', '_blank')} 
              className="bg-orange-500 hover:bg-orange-600 text-black px-8 py-3 rounded-2xl font-black shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95"
            >
              Manage Menu 📝
            </button>
            <button 
              onClick={fetchAdminData} 
              className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white px-8 py-3 rounded-2xl font-bold border border-gray-200 dark:border-white/10 transition-all"
            >
              Refresh 🔄
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Sales', value: `₹${stats.totalSales}`, icon: '💰', color: 'text-green-600 dark:text-green-400' },
            { label: 'Orders', value: stats.totalOrders, icon: '📦', color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Pending', value: stats.pendingOrders, icon: '⏳', color: 'text-orange-600 dark:text-orange-400' },
            { label: 'Delivered', value: stats.deliveredOrders, icon: '✅', color: 'text-emerald-600 dark:text-emerald-400' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-50 dark:bg-white/5 p-8 rounded-4xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none hover:border-orange-500/30 transition-all group">
              <span className="text-4xl group-hover:scale-125 transition-transform inline-block">{s.icon}</span>
              <p className="text-gray-500 dark:text-gray-400 mt-4 font-bold uppercase tracking-widest text-xs">{s.label}</p>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-4xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl dark:shadow-none transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th className="p-8">Order</th>
                  <th className="p-8">Customer</th>
                  <th className="p-8">Amount</th>
                  <th className="p-8">Status</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-8 font-mono text-orange-600 dark:text-orange-500 font-black">#{order.order_number}</td>
                    <td className="p-8">
                      <p className="font-black text-gray-900 dark:text-white">{order.customer_name}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">{order.customer_phone}</p>
                    </td>
                    <td className="p-8 font-black text-lg text-gray-900 dark:text-white">₹{order.total_amount}</td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : 
                        order.status === 'pending' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                        order.status === 'confirmed' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
                        order.status === 'preparing' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' :
                        order.status === 'ready' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        order.status === 'out_for_delivery' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' :
                        'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-3">
                        {!['delivered', 'cancelled'].includes(order.status) && (
                          <button 
                            onClick={() => advanceStatus(order.id)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                          >
                            Advance ➡️
                          </button>
                        )}
                        {!['delivered', 'cancelled'].includes(order.status) && (
                          <button 
                            onClick={() => cancelOrder(order.id)} 
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-6 py-2.5 rounded-xl text-xs font-black border border-red-500/20 transition-all active:scale-95"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
