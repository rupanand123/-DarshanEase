import React from "react";

interface TempleImageProps {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: "no-referrer" | "origin" | "unsafe-url";
}

export const TempleImage: React.FC<TempleImageProps> = ({
  src,
  alt,
  className = "",
  referrerPolicy
}) => {
  // If src starts with "emoji:" or contains emojis, or is the share.google link, or is not a valid http link
  const isEmoji = 
    src?.startsWith("emoji:") || 
    src?.includes("🛕") || 
    src?.includes("🙏") || 
    src?.includes("🌸") || 
    src?.includes("📿") || 
    src?.includes("🪔") ||
    !src?.startsWith("http") ||
    src?.includes("share.google");

  if (isEmoji) {
    let emojiStr = src || "";
    if (emojiStr.startsWith("emoji:")) {
      emojiStr = emojiStr.replace("emoji:", "");
    } else if (emojiStr.includes("share.google") || !emojiStr.startsWith("http")) {
      // Use standard premium devotional emojis
      emojiStr = "🛕 🙏 🌸 📿 🪔";
    }
    
    // Split into individual emoji tokens
    const emojis = Array.from(emojiStr.replace(/\s+/g, ""));

    return (
      <div className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border border-saffron-100 select-none overflow-hidden ${className}`}>
        {/* Sacred geometric pattern lines background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="flex items-center gap-3 sm:gap-4 justify-center relative z-10 scale-110 sm:scale-125 transition-all duration-500 group-hover:scale-135">
          {emojis.map((emoji, index) => (
            <span 
              key={index} 
              className="filter drop-shadow-md animate-pulse transform hover:scale-125 transition-transform" 
              style={{ animationDelay: `${index * 300}ms` }}
            >
              {emoji}
            </span>
          ))}
        </div>
        
        {/* Subtle glowing center */}
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none"></div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy={referrerPolicy}
    />
  );
};
