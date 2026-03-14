import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '',
    password: '',
    role: 'user',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password || (!isLogin && !formData.role)) {
      toast.error('Please fill required fields');
      return;
    }

    // Strong Password Validation (only for signup)
    if (!isLogin) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        toast.error('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const user = await login({ 
          username: formData.username, 
          password: formData.password 
        });
        
        // Redirect based on role
        if (user.role === 'admin') navigate('/admin-dashboard');
        else if (user.role === 'employee') navigate('/orders');
        else navigate('/menu');
      } else {
        await register({
          username: formData.username,
          email: formData.email || `${formData.username}@bon-gout.local`,
          password: formData.password,
          first_name: formData.username, // ✅ Auto-fill name from username
          role: formData.role,
          phone: formData.phone
        });
        setIsLogin(true); // Switch to login after signup
      }
    } catch (error) {
      // errors are handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pt-24 pb-12 flex items-center justify-center transition-colors duration-300">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-12">
          <div className="text-6xl mb-8 animate-bounce mx-auto w-24 h-24 bg-gray-100 dark:bg-white/10 rounded-3xl flex items-center justify-center shadow-lg dark:shadow-none transition-colors">
            {isLogin ? '👤' : '✨'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-4">
            {isLogin ? 'Welcome Back' : 'Join Bon Gout'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors">
            {isLogin ? 'Sign in to your account' : 'Create your account with a role'}
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-1 mb-8 border border-gray-200 dark:border-white/20 flex transition-colors shadow-md dark:shadow-none">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
              isLogin ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black shadow-xl' : 'text-gray-500 dark:text-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
              !isLogin ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black shadow-xl' : 'text-gray-500 dark:text-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-xl rounded-4xl p-10 border border-gray-200 dark:border-white/10 shadow-2xl dark:shadow-none transition-colors">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 transition-colors">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                >
                  <option value="user" className="bg-white dark:bg-gray-900">User</option>
                  <option value="employee" className="bg-white dark:bg-gray-900">Employee</option>
                  <option value="admin" className="bg-white dark:bg-gray-900">Admin</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 transition-colors">Username / Name</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors shadow-sm dark:shadow-none"
                placeholder="Enter username"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 transition-colors">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors shadow-sm dark:shadow-none"
                  placeholder="email@example.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 transition-colors">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors shadow-sm dark:shadow-none"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="text-[10px] text-gray-500 mt-2 leading-tight transition-colors">
                  Must be 8+ characters, include uppercase, lowercase, a number, and a special character (@$!%*?&).
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-black text-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-black shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In 🚀' : 'Create Account ✨')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
