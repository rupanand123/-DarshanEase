import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false
  });

  const faqs = [
    {
      q: "How early in advance should I book my ticket slot?",
      a: "Devotees are highly recommended to book slots at least 7 to 15 days in advance for popular temples like Tirupati Venkateswara Temple and Yadadri Lakshmi Narasimha, especially during weekends, major festivals, and holidays."
    },
    {
      q: "Are children below 12 required to book tickets?",
      a: "No, at most nationalized devasthanams, children under 12 years of age do not require separate entry passes and can enter free of charge along with their parents (valid age identity required at security verification)."
    },
    {
      q: "Can I book tickets for multiple temples at once?",
      a: "Yes, you can manage separate bookings for different dates and temples under your single devotee profile dashboard."
    },
    {
      q: "Is there any accommodation booking facility on DarshanEase?",
      a: "Currently, DarshanEase specializes in seamless Darshan entry slots and pooja passes. Accommodation queries should be coordinated directly with the respective temple devasthanam boards."
    }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setMsg("");
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const toggleFaq = (idx: number) => {
    setFaqOpen({ ...faqOpen, [idx]: !faqOpen[idx] });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12 text-left">
        
        {/* Title */}
        <div>
          <span className="text-[10px] text-saffron-600 font-bold uppercase tracking-widest block">Reach Our Support desk</span>
          <h1 className="text-3xl font-extrabold font-display text-gray-900 tracking-tight mt-1">Divine Journey Support</h1>
          <p className="text-gray-500 text-sm max-w-xl mt-1">
            Need help with a ticket, transaction issue, or state rules? Submit a ticket below, or contact Devasthanam officers directly.
          </p>
        </div>

        {/* Support Grid info & form */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Support Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xs space-y-6">
              <h3 className="text-base sm:text-lg font-bold font-display text-gray-900 border-b border-gray-100 pb-3">Devasthanam Hotlines</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3 text-xs leading-normal">
                  <div className="w-9 h-9 rounded-xl bg-saffron-50 text-saffron-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Support Helplines</h4>
                    <p className="text-gray-500">1800-425-11111 (Toll-Free)</p>
                    <p className="text-gray-500">+91 877 2233333 (International)</p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs leading-normal">
                  <div className="w-9 h-9 rounded-xl bg-saffron-50 text-saffron-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Email Enquiries</h4>
                    <p className="text-gray-500">helpdesk@darshanease.com</p>
                    <p className="text-gray-500">enquiry@devasthanam-gov.in</p>
                  </div>
                </div>

                <div className="flex gap-3 text-xs leading-normal">
                  <div className="w-9 h-9 rounded-xl bg-saffron-50 text-saffron-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Headquarters</h4>
                    <p className="text-gray-500">Devasthanam Administrative Building, Indrakeeladri Hills, Vijayawada, Andhra Pradesh, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Static Styled Google Maps representation */}
            <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Main Office Geolocation</h4>
              <div className="aspect-[16/10] rounded-2xl bg-saffron-50 border border-saffron-100 relative overflow-hidden flex flex-col items-center justify-center text-center p-6">
                {/* Background circles indicating map markers */}
                <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-saffron-200/50 animate-spin" />
                <div className="absolute w-16 h-16 rounded-full bg-saffron-100/60" />
                <MapPin className="w-10 h-10 text-saffron-600 relative z-10 animate-bounce" />
                <span className="font-bold text-gray-800 text-xs mt-3 relative z-10">Devasthanam Admin Center</span>
                <span className="text-[10px] text-gray-500 mt-1 relative z-10">Indrakeeladri Hill, Vijayawada</span>
              </div>
            </div>

          </div>

          {/* Contact Submit Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2rem] border border-saffron-100 shadow-sm space-y-6">
            <h3 className="text-base sm:text-lg font-bold font-display text-gray-900 border-b border-gray-100 pb-3">Submit a Support Ticket</h3>
            
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-150 p-6 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-950 text-sm">Ticket Submitted Successfully!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed px-4">
                  Thank you! Your query has been assigned to a support officer. We will review your message and reply back to your email within 12-24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-700 uppercase">Your Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-gray-700 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. ramesh@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-700 uppercase">Message Query</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe your query, ticket issues, or refund questions in detail..."
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs sm:text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-saffron hover:bg-saffron-600 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-saffron-100 transition-all cursor-pointer"
                >
                  <Send className="w-4.5 h-4.5" />
                  Submit Support Ticket
                </button>
              </form>
            )}
          </div>

        </div>

        {/* FAQs list accordion */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-950">Frequently Asked Questions</h2>
            <p className="text-gray-400 text-xs">Instantly resolve standard ticket rules and slot confirmation policies.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-3 text-xs sm:text-sm">
            {faqs.map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex justify-between items-center font-bold text-gray-900 bg-gray-50/20 hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4.5 h-4.5 text-saffron-500 shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 border-t border-gray-100 text-gray-600 leading-relaxed bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
