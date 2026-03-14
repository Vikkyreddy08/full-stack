import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-24 pb-12 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Hero 404 */}
        <div className="mb-12">
          <div className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-8 animate-pulse">
            404
          </div>
          <div className="text-6xl mb-6 animate-bounce">🤯</div>
        </div>

        {/* Main Message */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Oops! Page Not Found
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-lg text-gray-400">
            Don't worry, our delicious menu is just one click away!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
          <Link
            to="/"
            className="group bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black p-8 rounded-3xl font-black text-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-4"
          >
            <span>🏠</span>
            <span>Go Home</span>
          </Link>

          <Link
            to="/menu"
            className="group bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:border-orange-400/50 hover:bg-white/20 font-black text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-4"
          >
            <span>🍽️</span>
            <span>View Menu</span>
          </Link>

          <Link
            to="/orders"
            className="group bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white p-8 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-4"
          >
            <span>📋</span>
            <span>My Orders</span>
          </Link>
        </div>

        {/* Funny Message */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 max-w-2xl mx-auto">
          <p className="text-gray-400 text-lg italic">
            "Maybe the page got eaten by our hungry chef? 🧑‍🍳"
          </p>
        </div>

        {/* Navbar Links */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <p className="text-sm text-gray-500 mb-6">Quick Navigation:</p>
          <div className="flex flex-wrap justify-center gap-4 text-lg">
            <Link to="/" className="hover:text-orange-400 font-semibold transition-colors">🏠 Home</Link>
            <Link to="/menu" className="hover:text-orange-400 font-semibold transition-colors">🍽️ Menu</Link>
            <Link to="/orders" className="hover:text-orange-400 font-semibold transition-colors">📋 Orders</Link>
            <Link to="/about" className="hover:text-orange-400 font-semibold transition-colors">ℹ️ About</Link>
            <Link to="/contact" className="hover:text-orange-400 font-semibold transition-colors">📞 Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
