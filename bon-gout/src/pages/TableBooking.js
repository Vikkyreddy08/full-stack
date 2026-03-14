// import React from 'react';
// import { useContext } from 'react';
// import { Link } from 'react-router-dom';
// import { AppContext } from '../App.js';

// const TableBooking = () => {
//   const { user } = useContext(AppContext);

//   return (
//     <div className="pt-24 px-4 min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50">
//       <div className="max-w-4xl mx-auto">
//         {/* HEADER */}
//         <div className="text-center mb-20">
//           <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-emerald-600 via-green-500 to-blue-500 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
//             🪑 Table Booking
//           </h1>
//           <p className="text-2xl md:text-3xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//             Reserve your table at Bon Gout - Authentic Hyderabadi Flavors
//           </p>
//         </div>

//         {/* LOGIN CHECK */}
//         {!user && (
//           <div className="max-w-md mx-auto bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-2xl text-center border border-gray-200">
//             <div className="text-6xl mb-8">🔐</div>
//             <h2 className="text-4xl font-bold text-gray-800 mb-6">Login Required</h2>
//             <p className="text-xl text-gray-600 mb-8">Please login to book a table</p>
//             <Link 
//               to="/login" 
//               className="inline-block bg-gradient-to-r from-emerald-500 to-green-500 text-white px-12 py-6 rounded-2xl font-bold text-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
//             >
//               Login to Book
//             </Link>
//           </div>
//         )}

//         {/* BOOKING FORM */}
//         {user && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//             {/* FORM */}
//             <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-200">
//               <h3 className="text-4xl font-bold text-gray-800 mb-8">Book Your Table</h3>
//               <form className="space-y-6">
//                 <div>
//                   <label className="block text-xl font-semibold mb-4 text-gray-700">Date & Time</label>
//                   <input 
//                     type="datetime-local" 
//                     className="w-full p-6 text-xl border-2 border-gray-200 rounded-3xl focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xl font-semibold mb-4 text-gray-700">Number of Guests</label>
//                   <select className="w-full p-6 text-xl border-2 border-gray-200 rounded-3xl focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100">
//                     <option>2 people</option>
//                     <option>4 people</option>
//                     <option>6 people</option>
//                     <option>8+ people</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xl font-semibold mb-4 text-gray-700">Special Requests</label>
//                   <textarea 
//                     rows="4"
//                     placeholder="Window seat, birthday celebration, etc..."
//                     className="w-full p-6 text-xl border-2 border-gray-200 rounded-3xl focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 resize-none"
//                   />
//                 </div>
//                 <button 
//                   type="submit"
//                   className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-8 rounded-3xl font-bold text-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
//                 >
//                   Reserve Table Now
//                 </button>
//               </form>
//             </div>

//             {/* TABLE AVAILABILITY */}
//             <div className="space-y-6">
//               <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-8 rounded-3xl shadow-2xl">
//                 <h4 className="text-3xl font-bold mb-4">Today's Availability</h4>
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-xl">
//                     <span>12:00 PM - 2:00 PM</span>
//                     <span className="font-bold">✅ 12 tables</span>
//                   </div>
//                   <div className="flex justify-between text-xl">
//                     <span>7:00 PM - 10:00 PM</span>
//                     <span className="font-bold">✅ 8 tables</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4 p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200">
//                 <div className="text-center p-6 bg-emerald-100 rounded-2xl">
//                   <div className="text-4xl mb-2">⭐</div>
//                   <div className="font-bold text-xl">VIP Tables</div>
//                   <div className="text-emerald-700">₹500 extra</div>
//                 </div>
//                 <div className="text-center p-6 bg-blue-100 rounded-2xl">
//                   <div className="text-4xl mb-2">🌅</div>
//                   <div className="font-bold text-xl">Window View</div>
//                   <div className="text-blue-700">Most popular</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TableBooking;
