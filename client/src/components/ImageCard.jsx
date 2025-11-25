import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Heart, Download, MessageCircle } from "lucide-react";
import ShareButton from "./ShareButton";

function ImageCard({ creation, onLikeToggle, onCardClick }) {
  const { user } = useUser();
  const isLiked = user && creation.likes.includes(user.id);

  const userDisplayName = creation.username || "Anonymous";
  const userImage = creation.user_img;

  return (
    <div
      onClick={() => onCardClick(creation)}
      // FIX 1: Set a consistent mobile aspect ratio (e.g., square for better mobile stacking).
      // Use `aspect-square` (1:1) on small screens—it's compact and uniform for grids.
      // Keep 4:5 on md+ for portrait feel. This prevents jagged rows and collapse.
      className="relative group w-full rounded-lg overflow-hidden aspect-square sm:aspect-[3/4] md:aspect-[4/5] cursor-pointer bg-zinc-900 border border-zinc-800"
    >
      {/* FIX 2: Add a fallback background or skeleton loader for pre-load state.
           This prevents zero-height flash. You could enhance with a shimmer effect via CSS. */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900" />

      <img
        className="absolute inset-0 w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
        src={creation.content}
        alt="Creation"
        loading="lazy"
        // FIX 3: Add error handling to prevent broken image states.
        onError={(e) => {
          e.target.style.display = "none"; // Hide broken images
          // Optionally show a fallback icon or text
        }}
      />

      {/* User info appears on hover/tap—fine as-is, but tightened padding for mobile. */}
      <div className="absolute top-2 left-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {userImage ? (
          <img
            src={userImage}
            alt={userDisplayName}
            className="w-7 h-7 rounded-full object-cover border-2 border-white/20 shadow-md" // Slightly smaller on mobile
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white text-xs border-2 border-white/20">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-semibold text-white text-xs bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
          {userDisplayName}
        </span>
      </div>

      {/* Hover/Tap Overlay—adjusted padding for tighter mobile fit. */}
      <div className="absolute inset-0 flex items-end justify-between p-2 sm:p-3 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Left side actions: Likes and Comments—reduced gap/padding for mobile. */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full backdrop-blur-sm">
            <Heart
              onClick={(e) => {
                e.stopPropagation();
                onLikeToggle(creation.id);
              }}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer hover:scale-110 transition ${
                isLiked ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
            <p className="text-white text-xs font-medium">
              {creation.likes.length}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full backdrop-blur-sm">
            <MessageCircle
              onClick={(e) => {
                e.stopPropagation();
                onCardClick(creation);
              }}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white cursor-pointer hover:scale-110 transition"
            />
            <p className="text-white text-xs font-medium">
              {creation.comments?.length || 0}
            </p>
          </div>
        </div>

        {/* Right side action: Download & Share—stack vertically on very small screens if needed. */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="bg-black/40 p-1 rounded-full backdrop-blur-sm">
            <ShareButton
              url={creation.content}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white cursor-pointer hover:scale-110 transition flex items-center justify-center"
              iconSize={12} // Smaller on mobile
            />
          </div>
          <button className="bg-black/40 p-1 rounded-full backdrop-blur-sm">
            <Download
              onClick={(url = creation.content) => {
                const filename = `creation-${Date.now()}.png`;
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", filename);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white cursor-pointer hover:scale-110 transition"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCard;
