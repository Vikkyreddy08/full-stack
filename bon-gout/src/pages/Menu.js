import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DEFAULT_FOOD_IMAGE = "https://images.unsplash.com/photo-1603482665472-61d5a5c8f6ca?w=500";

const ReviewModal = ({ isOpen, onClose, dish, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(dish.id, { rating, comment });
      onClose();
      setComment("");
      setRating(5);
    } catch (err) {
      // toast handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1a1c1e] rounded-3xl p-8 max-w-md w-full border border-gray-200 dark:border-white/10 shadow-2xl transition-colors duration-300">
        <h3 className="text-2xl font-black mb-6 text-gray-900 dark:text-white">Review {dish.name}</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={`w-12 h-12 rounded-xl text-xl font-bold transition-all ${
                    rating >= num ? "bg-orange-500 text-black" : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Your Experience</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              placeholder="How was the taste?..."
              className="w-full h-32 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 rounded-2xl font-black bg-gradient-to-r from-orange-500 to-yellow-500 text-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Submit 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MenuCard = React.memo(({ item, onAddToCart, onReviewClick, canReview, isUser }) => {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <div className="rounded-2xl bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 p-4 md:p-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full shadow-lg dark:shadow-none">
      <div className="relative h-40 md:h-48 overflow-hidden rounded-xl mb-4">
        <img 
          src={item.image || DEFAULT_FOOD_IMAGE} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          onError={(e) => { e.target.src = DEFAULT_FOOD_IMAGE; }}
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold backdrop-blur flex items-center gap-1">
          ⭐ {item.average_rating || "New"}
          {item.total_reviews > 0 && <span className="text-gray-400 font-normal">({item.total_reviews})</span>}
        </div>
        {item.is_spicy && (
          <div className="absolute top-2 left-2 bg-red-500/90 text-white px-2 py-1 rounded-full text-[10px] md:text-xs font-bold backdrop-blur">
            🌶️ Spicy
          </div>
        )}
        {item.is_veg && (
          <div className="absolute bottom-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded-full text-[10px] md:text-xs font-bold backdrop-blur">
            🌿 Veg
          </div>
        )}
      </div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg md:text-xl font-bold line-clamp-1 text-gray-900 dark:text-white">{item.name}</h3>
        <div className="flex gap-2">
          {canReview && (
            <button 
              onClick={() => onReviewClick(item)}
              className="text-[10px] md:text-xs text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 font-bold border-b border-orange-600/30 dark:border-orange-400/30"
            >
              Rate
            </button>
          )}
          {item.reviews && item.reviews.length > 0 && (
            <button 
              onClick={() => setShowReviews(!showReviews)}
              className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-bold border-b border-blue-600/30 dark:border-blue-400/30"
            >
              {showReviews ? "Hide" : "Reviews"}
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
      
      {/* Past Reviews Preview - TOGGLEABLE */}
      {showReviews && item.reviews && item.reviews.length > 0 && (
        <div className="mb-4 bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-300">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Latest Review</p>
          <p className="text-[10px] md:text-xs italic text-gray-700 dark:text-gray-300">"{item.reviews[0].comment}"</p>
          <p className="text-[10px] text-orange-600 dark:text-orange-500 font-bold mt-1">— {item.reviews[0].username}</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-auto pt-2">
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">₹{item.price}</span>
          <span className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-tighter">⏱️ {item.prep_time || '20min'}</span>
        </div>
        {isUser && (
          <button 
            onClick={() => onAddToCart(item)} 
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base text-black shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
});

export default function Menu() {
  const { addToCart, cartCount } = useCart();
  const { user, isUser } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("default"); // "default", "rating", "price"
  
  // Review Modal State
  const [selectedDish, setSelectedDish] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes] = await Promise.all([
        api.get('menu/'),
        api.get('categories/')
      ]);
      
      // ✅ Standardized response audit: res.data.data contains the list or paginated results
      const itemsData = itemsRes.data.data || itemsRes.data;
      const catsData = catsRes.data.data || catsRes.data;
      
      const items = itemsData.results || itemsData;
      const cats = catsData.results || catsData;
      
      setMenuItems(Array.isArray(items) ? items : []);
      
      // ✅ Deduplicate categories by name (case-insensitive and trimmed) to prevent duplicates
      const uniqueCats = ["All"];
      if (Array.isArray(cats)) {
        cats.forEach(c => {
          if (c.name) {
            const cleanName = c.name.trim();
            // Case-insensitive check
            const exists = uniqueCats.some(uc => uc.toLowerCase() === cleanName.toLowerCase());
            if (!exists) {
              uniqueCats.push(cleanName);
            }
          }
        });
      }
      setCategories(uniqueCats);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (dishId, reviewData) => {
    try {
      const response = await api.post(`menu/${dishId}/add_review/`, reviewData);
      toast.success(response.data.message || "Review submitted! Thank you. ✨");
      fetchMenuData(); // Refresh to show new rating
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to submit review";
      toast.error(errorMsg);
      throw error;
    }
  };

  const filteredItems = useMemo(() => {
    let items = menuItems.filter((item) => {
      const itemCategory = typeof item.category === 'object' ? item.category.name : item.category_name || item.category;
      const matchCategory = selectedCategory === "All" || itemCategory === selectedCategory;
      const matchSearch = searchTerm === "" || 
                         item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchSearch;
    });

    if (sortOrder === "rating") {
      items.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else if (sortOrder === "price") {
      items.sort((a, b) => a.price - b.price);
    }

    return items;
  }, [selectedCategory, searchTerm, menuItems, sortOrder]);

  const handleAddToCart = (item) => {
    if (!isUser) {
      toast.error("Only customers can place orders! 🍽️");
      return;
    }
    addToCart(item);
  };

  const handleReviewClick = (item) => {
    setSelectedDish(item);
    setIsReviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-gray-900 dark:text-white text-2xl font-black transition-colors duration-300">
        🍽️ Loading Menu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 text-gray-900 dark:text-white pt-24 px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-4 md:mb-6">
            🍽️ Premium Menu
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Authentic Hyderabadi flavors delivered hot & fresh to your table
          </p>
        </div>

        {/* Filters & Sorting */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-4 md:p-8 border border-gray-200 dark:border-white/10 mb-8 md:mb-12 transition-colors duration-300 shadow-lg dark:shadow-none">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 justify-between items-center">
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-sm md:font-semibold transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-orange-500 text-black shadow-xl"
                      : "bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 border border-gray-300 dark:border-white/20 text-gray-800 dark:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center w-full lg:w-auto">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full sm:w-auto bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl md:rounded-2xl px-4 py-3 md:py-4 text-sm text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="default" className="bg-white dark:bg-gray-900">Recommended</option>
                <option value="rating" className="bg-white dark:bg-gray-900">Highest Rated</option>
                <option value="price" className="bg-white dark:bg-gray-900">Price: Low to High</option>
              </select>
              
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="🔍 Search dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 md:py-4 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl md:rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">😢</div>
            <h2 className="text-3xl font-bold mb-4">No dishes found</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <MenuCard 
                key={item.id} 
                item={item} 
                onAddToCart={handleAddToCart} 
                onReviewClick={handleReviewClick}
                canReview={isUser} // Only regular users can review
                isUser={isUser}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedDish && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          dish={selectedDish}
          onSubmit={handleAddReview}
        />
      )}
    </div>
  );
}
