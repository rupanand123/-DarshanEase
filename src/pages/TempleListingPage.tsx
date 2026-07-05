import React, { useState, useMemo } from "react";
import { Temple } from "../types";
import { TempleImage } from "../components/TempleImage";
import { Search, MapPin, Star, SlidersHorizontal, ArrowUpDown, Flame, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface TempleListingPageProps {
  temples: Temple[];
  onSelectTemple: (temple: Temple) => void;
  onBookNow: (templeId: string) => void;
}

export const TempleListingPage: React.FC<TempleListingPageProps> = ({
  temples,
  onSelectTemple,
  onBookNow
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // Get unique states and types for filter dropdowns
  const statesList = useMemo(() => {
    const states = new Set(temples.map(t => t.state));
    return ["All", ...Array.from(states)];
  }, [temples]);

  const typesList = useMemo(() => {
    const types = new Set(temples.map(t => t.type));
    return ["All", ...Array.from(types)];
  }, [temples]);

  // Filter and sort temples
  const filteredAndSortedTemples = useMemo(() => {
    let result = [...temples];

    // Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.location.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    // State filter
    if (selectedState !== "All") {
      result = result.filter(t => t.state === selectedState);
    }

    // Type filter
    if (selectedType !== "All") {
      result = result.filter(t => t.type === selectedType);
    }

    // Sort
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "priceAsc") {
      result.sort((a, b) => a.ticketPrice - b.ticketPrice);
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => b.ticketPrice - a.ticketPrice);
    }

    return result;
  }, [temples, searchQuery, selectedState, selectedType, sortBy]);

  return (
    <div className="bg-[#FFF9F2] text-[#2D2D2D] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Title & Subtitle */}
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-extrabold font-display text-gray-900 tracking-tight">Sacred Temples</h1>
          <p className="text-gray-500 text-sm max-w-xl">
            Browse through historical and sacred shrines. View available darshan timings, special entry details, and book your passes with instant confirmation.
          </p>
        </div>

        {/* Search, Filter, and Sort Control Panel */}
        <div className="bg-white p-6 rounded-[2rem] border border-orange-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search temple, location, or deity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-2xl text-xs outline-hidden transition-all"
            />
          </div>

          {/* Filters & Sorter Grid */}
          <div className="w-full md:w-auto flex flex-wrap gap-3 items-center justify-end">
            
            {/* State Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200">
              <SlidersHorizontal className="w-3.5 h-3.5 text-saffron-600" />
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 outline-hidden border-none"
              >
                {statesList.map(st => (
                  <option key={st} value={st}>{st === "All" ? "All States" : st}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200">
              <Flame className="w-3.5 h-3.5 text-saffron-600" />
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 outline-hidden border-none"
              >
                {typesList.map(tp => (
                  <option key={tp} value={tp}>{tp === "All" ? "All Categories" : tp}</option>
                ))}
              </select>
            </div>

            {/* Sorter */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-saffron-600" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 outline-hidden border-none"
              >
                <option value="default">Sort: Default</option>
                <option value="rating">Sort: Popularity</option>
                <option value="priceAsc">Sort: Price (Low to High)</option>
                <option value="priceDesc">Sort: Price (High to Low)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Temples Listing Results Grid */}
        {filteredAndSortedTemples.length === 0 ? (
          <div className="bg-white rounded-3xl border border-saffron-100 p-12 text-center max-w-lg mx-auto">
            <HelpCircle className="w-12 h-12 text-saffron-400 mx-auto mb-3" />
            <h3 className="font-display font-bold text-gray-800 text-lg">No Sacred Temples Found</h3>
            <p className="text-gray-500 text-xs mt-1">
              We couldn't match any temples to your search query. Try typing another state, deity form, or location.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredAndSortedTemples.map((temple, idx) => (
              <motion.div
                key={temple.templeId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
                className="bento-card overflow-hidden group flex flex-col h-full text-left"
              >
                <div className="relative aspect-video overflow-hidden">
                  <TempleImage 
                    src={temple.image} 
                    alt={temple.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-bold text-gray-800 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {temple.rating}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-saffron-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {temple.type}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-saffron-500 shrink-0" />
                      <span>{temple.location}, {temple.state}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-saffron-600 transition-colors">
                      {temple.name}
                    </h3>
                    <p className="text-gray-500 text-xs line-clamp-2 mt-2 leading-relaxed">
                      {temple.description}
                    </p>

                    {/* Slots counter indicator */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {temple.availableSlots.slice(0, 3).map((sl, sIdx) => (
                        <span key={sIdx} className="bg-orange-50/50 text-orange-700 border border-orange-100/50 text-[9px] px-2 py-0.5 rounded-md font-medium">
                          {sl.split(" - ")[0]}
                        </span>
                      ))}
                      {temple.availableSlots.length > 3 && (
                        <span className="bg-saffron-50 text-saffron-700 border border-saffron-100 text-[9px] px-2 py-0.5 rounded-md font-semibold">
                          +{temple.availableSlots.length - 3} Slots
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-orange-100/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Passes From</span>
                      <span className="text-sm font-extrabold text-saffron-700 font-sans">
                        {temple.ticketPrice === 0 ? "Free Entry" : `₹${temple.ticketPrice}`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectTemple(temple)}
                        className="px-3 py-2 bg-[#FFF3E6] hover:bg-saffron-100 text-xs font-bold text-[#FF9933] rounded-xl transition-all cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onBookNow(temple.templeId)}
                        className="px-4 py-2 bg-gradient-saffron hover:bg-saffron-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
