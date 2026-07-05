import React, { useState, useEffect } from "react";
import { Temple, FeedbackRecord } from "../types";
import { TempleImage } from "../components/TempleImage";
import { InteractiveTempleMap } from "../components/InteractiveTempleMap";
import { dbService } from "../services/db";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  Flame, 
  Award, 
  Compass, 
  HelpCircle,
  Star,
  Send,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

interface TempleDetailPageProps {
  temple: Temple;
  onBack: () => void;
  onBookNow: (templeId: string) => void;
}

export const TempleDetailPage: React.FC<TempleDetailPageProps> = ({
  temple,
  onBack,
  onBookNow
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<FeedbackRecord[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [activeImage, setActiveImage] = useState(temple.image);

  // Load past reviews
  const loadReviews = async () => {
    const data = await dbService.getFeedbackByTemple(temple.templeId);
    setReviews(data);
  };

  useEffect(() => {
    loadReviews();
    setActiveImage(temple.image);
  }, [temple]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in or use reviewer mode to submit feedback!");
      return;
    }
    if (newComment.trim() === "") return;

    const feedback: FeedbackRecord = {
      feedbackId: "feedback-" + Date.now(),
      userId: user.userId,
      userName: user.name,
      templeId: temple.templeId,
      rating: newRating,
      comment: newComment,
      createdAt: new Date().toISOString()
    };

    await dbService.saveFeedback(feedback);
    setNewComment("");
    setNewRating(5);
    loadReviews();
  };

  return (
    <div className="bg-[#FFF9F2] text-[#2D2D2D] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-saffron-600 bg-white hover:bg-saffron-50 rounded-full border border-gray-100 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Temples
        </button>

        {/* Details Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Images & Overview */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Gallery Frame */}
            <div className="bg-white p-3 rounded-[2rem] border border-saffron-100 shadow-sm space-y-3">
              <div className="aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
                <TempleImage 
                  src={activeImage} 
                  alt={temple.name} 
                  className="w-full h-full object-cover transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Image Thumbnails if multiple exist */}
              {temple.images && temple.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {temple.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImage === img ? "border-saffron-500 scale-95" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                    >
                      <TempleImage src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & History Card */}
            <div className="bento-card p-6 sm:p-8 text-left space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 font-display">Divine Profile</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {temple.description}
                </p>
              </div>

              {temple.history && (
                <div className="space-y-2 pt-4 border-t border-orange-100">
                  <h3 className="text-lg font-bold text-gray-900 font-display flex items-center gap-1.5">
                    <Compass className="w-5 h-5 text-saffron-500" />
                    Sacred History
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {temple.history}
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Complex Map and Navigation */}
            <InteractiveTempleMap temple={temple} />

            {/* Rules and guidelines */}
            <div className="bento-card p-6 sm:p-8 text-left space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-saffron-600" />
                Devasthanam Regulations
              </h3>
              <ul className="space-y-2">
                {temple.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs text-gray-600 leading-relaxed">
                    <CheckCircle className="w-4.5 h-4.5 text-saffron-500 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Bookings, Darshan pricing, rules */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Quick Pricing & Booking Card */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-orange-200 shadow-md space-y-6 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-saffron-50 rounded-full pointer-events-none" />
              
              <div>
                <span className="text-[10px] bg-saffron-100 text-saffron-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {temple.type}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 font-display leading-tight">{temple.name}</h1>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 text-saffron-500" />
                  <span>{temple.location}, {temple.state}</span>
                </div>
              </div>

              {/* Timings */}
              <div className="bg-[#FFF9F2] p-4 rounded-2xl flex items-center justify-between border border-orange-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-4.5 h-4.5 text-saffron-600" />
                  <div>
                    <span className="font-semibold block text-[10px] uppercase text-gray-400">Timings</span>
                    <span>{temple.openingTime} - {temple.closingTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{temple.rating} / 5.0</span>
                </div>
              </div>

              {/* Darshan pricing grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Pooja Entry Pass Categories</h4>
                <div className="space-y-2.5">
                  {temple.darshanTypes.map((type, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex justify-between items-start gap-4"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-800">{type.name}</span>
                        <p className="text-[10px] text-gray-500 leading-normal">{type.description}</p>
                      </div>
                      <span className="text-xs font-extrabold text-saffron-700 shrink-0">
                        {type.price === 0 ? "Free" : `₹${type.price}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking CTA button */}
              <button
                onClick={() => onBookNow(temple.templeId)}
                className="w-full py-3.5 bg-gradient-saffron hover:bg-saffron-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-saffron-200 hover:shadow-lg transition-all"
              >
                Proceed to Book Slots
              </button>

            </div>

            {/* Facilities Card */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 font-display flex items-center gap-1.5">
                <Award className="w-5 h-5 text-saffron-600" />
                Devasthanam Facilities
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {temple.facilities.map((fac, idx) => (
                  <div key={idx} className="bg-slate-50/70 p-2.5 rounded-xl border border-gray-100/50 text-xs text-gray-600 font-medium">
                    {fac}
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback and Reviews Section */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xs space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 font-display">Devotee Feedback</h3>
                <span className="text-[10px] text-saffron-600 font-bold bg-saffron-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {reviews.length} Review(s)
                </span>
              </div>

              {/* Submit Review Form */}
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-3 bg-saffron-50/30 p-4 rounded-2xl border border-saffron-100/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-saffron-800 uppercase tracking-wide">Write a feedback</span>
                    {/* Stars selection */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-hidden"
                        >
                          <Star className={`w-4 h-4 ${star <= newRating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Share your spiritual experience..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 focus:border-saffron-300 rounded-xl px-3 py-2 text-xs outline-hidden transition-all"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-gradient-saffron text-white rounded-xl hover:opacity-95 transition-opacity"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50/50 p-4 rounded-2xl text-center text-xs text-gray-500 border border-gray-100">
                  Please sign in to write an experience feedback.
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {reviews.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-4">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.feedbackId} className="space-y-1.5 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-800 leading-none">{rev.userName}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < rev.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed italic pr-2">
                        "{rev.comment}"
                      </p>
                      <span className="block text-[9px] text-gray-400 font-sans">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
