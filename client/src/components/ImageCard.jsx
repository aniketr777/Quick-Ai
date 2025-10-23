import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Heart, Download, MessageCircle } from "lucide-react"; // Imported MessageCircle

function ImageCard({ creation, onLikeToggle, onDownload, onCardClick }) {
  const { user } = useUser();
  const isLiked = user && creation.likes.includes(user.id);

  const userDisplayName = creation.username || "Anonymous";
  const userImage = creation.user_img;

  return (
    <div
      onClick={() => onCardClick(creation)} // The whole card is clickable
      className="relative group w-full rounded-lg overflow-hidden aspect-w-1 aspect-h-1 cursor-pointer"
    >
      <img
        className="absolute inset-0 w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
        src={creation.content}
        alt="Creation"
      />

      {/* User info appears on hover, without background */}
      <div className="absolute top-0 left-0 p-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {userImage ? (
          <img
            src={userImage}
            alt={userDisplayName}
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center font-bold text-white text-sm border-2 border-white">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          className="font-semibold text-white text-sm"
          style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }} // Text shadow for readability
        >
          {userDisplayName}
        </span>
      </div>

      {/* Hover Overlay for Actions */}
      <div className="absolute inset-0 flex items-end justify-between p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
        {/* Left side actions: Likes and Comments */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Heart
              onClick={(e) => {
                e.stopPropagation(); // Prevents modal from opening
                onLikeToggle(creation.id);
              }}
              className={`w-5 h-5 cursor-pointer hover:scale-110 transition ${
                isLiked ? "fill-red-500 text-red-600" : "text-white"
              }`}
            />
            <p className="text-white text-sm">{creation.likes.length}</p>
          </div>
          {/* Comment Icon and Count */}
          {/* <div className="flex items-center gap-1">
            <MessageCircle className="w-5 h-5 text-white" />
            <p className="text-white text-sm">
              {creation.comments?.length || 0}
            </p>
          </div> */}
        </div>

        {/* Right side action: Download */}
        <Download
          onClick={(e) => {
            e.stopPropagation(); // Prevents modal from opening
            onDownload(creation.content);
          }}
          className="w-5 h-5 text-white cursor-pointer hover:scale-110 transition"
        />
      </div>
    </div>
  );
}

export default ImageCard;
