import React from "react";
import { motion } from "motion/react";
import { Temple } from "../types";
import { TempleImage } from "../components/TempleImage";
import { 
  Compass, 
  ShieldCheck, 
  Ticket, 
  CalendarClock, 
  Activity, 
  Smartphone, 
  ArrowRight, 
  Star, 
  MapPin, 
  BookOpen,
  Info
} from "lucide-react";

interface LandingPageProps {
  temples: Temple[];
  onSelectTemple: (temple: Temple) => void;
  onExploreTemples: () => void;
  onBookNow: (templeId: string) => void;
  onSelectTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  temples,
  onSelectTemple,
  onExploreTemples,
  onBookNow,
  onSelectTab
}) => {
  const popularTemples = temples.filter(t => t.popular || t.rating >= 4.7);

  const features = [
    {
      title: "Online Booking",
      desc: "Reserve slots for special, VIP, or free darshans instantly from anywhere.",
      icon: Compass,
      color: "text-saffron-600 bg-saffron-50"
    },
    {
      title: "Secure Payments",
      desc: "Fully integrated trusted demo checkouts with immediate receipt confirmations.",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      title: "Instant QR Ticket",
      desc: "Receive digital tickets with dynamic QR codes directly to your device.",
      icon: Ticket,
      color: "text-amber-600 bg-amber-50"
    },
    {
      title: "Easy Cancellation",
      desc: "Spiritual plans changed? Cancel bookings or rebook slots with a single tap.",
      icon: CalendarClock,
      color: "text-rose-600 bg-rose-50"
    },
    {
      title: "Live Slot Availability",
      desc: "Check available counts for different times and poojas in real-time.",
      icon: Activity,
      color: "text-blue-600 bg-blue-50"
    },
    {
      title: "Mobile Friendly",
      desc: "Beautiful layout engineered to fit screens of all dimensions and mobile browsers.",
      icon: Smartphone,
      color: "text-purple-600 bg-purple-50"
    }
  ];

  return (
    <div className="bg-[#FFF9F2] text-[#2D2D2D] min-h-screen font-sans overflow-x-hidden pb-12">
      
      {/* Hero Section - Styled as a magnificent Bento Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <div className="bg-gradient-to-br from-[#FF9933] to-[#F27D26] rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden grid md:grid-cols-12 gap-8 items-center border border-orange-200">
          
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="col-span-12 md:col-span-7 space-y-6 text-left relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/20 text-white rounded-full text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-100 animate-pulse" />
              <span>Temple Darshan Bookings Live for 2026</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-tight">
              Experience Divine <br />
              <span className="text-orange-100 italic">Without the Wait.</span>
            </h1>
            
            <p className="text-orange-50 text-sm sm:text-base max-w-lg leading-relaxed opacity-95">
              Book your temple visits and special poojas online with seamless instant QR verification. Avoid long queues and secure peaceful holy sights.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onExploreTemples}
                className="flex items-center gap-2 bg-white text-[#FF9933] px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm"
              >
                Book Your Slot
                <ArrowRight className="w-4 h-4 text-[#FF9933]" />
              </button>
              <button
                onClick={() => onSelectTab && onSelectTab("temples")}
                className="px-8 py-4 bg-orange-800/20 backdrop-blur-md border border-white/30 text-white rounded-2xl font-bold hover:bg-orange-800/30 transition-all cursor-pointer text-sm"
              >
                Explore Shrines
              </button>
            </div>
          </motion.div>

          {/* Hero Right Image Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="col-span-12 md:col-span-5 relative z-10"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-saffron-500 to-gold-400 rounded-[2.5rem] blur-xl opacity-20" />
            <div className="relative aspect-video sm:aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl">
              <TempleImage 
                src="emoji:🛕🙏🌸📿🪔" 
                alt="Divine Temple Entrance" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                <span className="text-[10px] bg-saffron-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Tirumala</span>
                <h3 className="text-lg font-bold mt-1.5">Tirupati Venkateswara Temple</h3>
                <p className="text-[10px] text-gray-200 mt-0.5">Most Visited Spiritual Center in India</p>
              </div>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute right-10 top-10 opacity-15">
            <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z"/>
              <circle cx="50" cy="50" r="20"/>
            </svg>
          </div>

        </div>
      </section>

      {/* Popular Temples Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs text-saffron-600 font-bold uppercase tracking-widest">Divine Destinations</span>
          <h2 className="text-3xl font-bold font-display text-gray-900">Explore Sacred Shrines</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Quickly secure preferred time slots and customized entry poojas at India's most highly revered temples.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {popularTemples.slice(0, 6).map((temple, idx) => (
            <motion.div
              key={temple.templeId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
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
                </div>

                <div className="pt-5 mt-4 border-t border-orange-100/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">Passes From</span>
                    <span className="text-sm font-extrabold text-saffron-700 font-sans">
                      {temple.ticketPrice === 0 ? "Free Entry" : `₹${temple.ticketPrice}`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectTemple(temple)}
                      className="px-3.5 py-2 bg-[#FFF3E6] hover:bg-saffron-100 text-xs font-bold text-[#FF9933] rounded-xl transition-all cursor-pointer"
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

        <div className="text-center mt-10">
          <button
            onClick={() => onSelectTab("temples")}
            className="inline-flex items-center gap-1.5 px-6 py-3 border border-saffron-200 hover:bg-saffron-50 text-saffron-700 text-xs font-bold rounded-2xl transition-colors"
          >
            Explore All Temples
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs text-saffron-600 font-bold uppercase tracking-widest">Why DarshanEase</span>
          <h2 className="text-3xl font-bold font-display text-gray-900">Designed for Devotees</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            A comprehensive system offering secure slots, instant ticket passes, and transparent cancellation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bento-card p-6 flex gap-4 text-left"
              >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-800 text-sm">{feat.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl font-bold font-display text-gray-900">Spiritual Booking FAQ</h2>
          <p className="text-gray-500 text-xs">Answering your essential queries about online temple slot reservations.</p>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-saffron-500 shrink-0" />
              What documents are required to visit?
            </h4>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              Devotees must carry the original identity proof used while booking the slot (e.g. Aadhaar Card, Passport, Voter Card) for physical verification at the main entrance.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-saffron-500 shrink-0" />
              Can I cancel my slot booking?
            </h4>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              Yes, bookings can be cancelled or rescheduled up to 24 hours prior to the reserved slot timing via the 'My Bookings' tab on your profile dashboard.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-saffron-500 shrink-0" />
              How do I get my Laddu prasadam?
            </h4>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">
              For paid tickets (like Special Entry), your digital QR ticket includes prasadam entitlements. After darshan, head to the Devasthanam prasadam counters and scan your QR code to receive the sacred sweets.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8 text-left text-xs">
          <div className="space-y-4 col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-saffron flex items-center justify-center text-white font-bold">
                <Ticket className="w-4.5 h-4.5" />
              </div>
              <span className="text-base font-bold font-display text-white">DarshanEase</span>
            </div>
            <p className="max-w-xs leading-relaxed">
              Bringing technology and spiritual devotion together for a seamless, hassle-free temple travel experience across sacred sites.
            </p>
            <p>© 2026 DarshanEase. All rights reserved.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onSelectTab("contact")} className="hover:text-white transition-colors">Contact Support</button></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Temples</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onSelectTab("temples")} className="hover:text-white transition-colors">Tirupati Venkateswara</button></li>
              <li><button onClick={() => onSelectTab("temples")} className="hover:text-white transition-colors">Srisailam Mallikarjuna</button></li>
              <li><button onClick={() => onSelectTab("temples")} className="hover:text-white transition-colors">Yadadri Narasimha</button></li>
            </ul>
          </div>
        </div>
      </footer>

    </div>
  );
};
