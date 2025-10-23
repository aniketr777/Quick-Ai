import React, { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import CommentModal from "./CommentModal"; 



function PromptCard({ creation, onLikeToggle }) {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal

  const userDisplayName = creation.username || "Anonymous";
  const userImage = creation.user_img;
  const isLiked = user && creation.likes.includes(user.id);
  // const commentCount = creation.comments?.length || 0;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col h-full w-full max-w-xs mx-auto"
      >
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-3">
          {userImage ? (
            <img
              src={userImage}
              alt={userDisplayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-gray-800 text-sm truncate">
            {userDisplayName}
          </span>
        </div>

        {/* Card Content */}
        <div className="mb-4 text-gray-800 text-sm flex flex-col flex-grow">
          {/* Heading / Title */}
          <p className="font-semibold text-lg mb-2 text-ellipsis overflow-hidden whitespace-nowrap">
            {creation.title || creation.heading}
          </p>

          {/* Prompt Content */}
          <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
            {creation.prompt}
          </p>
        </div>

        {/* Card Actions */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center gap-4 text-gray-500">
          {/* Like Button */}
          <div className="flex items-center gap-2">
            <Heart
              onClick={() => onLikeToggle(creation.id)}
              className={`w-5 h-5 cursor-pointer hover:scale-110 ${
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
            <span className="text-xs font-medium">{creation.likes.length}</span>
          </div>
          {/* Comment Button - Now opens the modal */}
          {/* <div className="flex items-center gap-2">
            <MessageCircle
              onClick={() => setIsModalOpen(true)} // Set state to true to open modal
              className="w-5 h-5 cursor-pointer text-gray-400 hover:text-blue-500"
            />
            <span className="text-xs font-medium">{commentCount}</span>
          </div> */}
        </div>
      </div>

      {/* Render the modal */}
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Pass the function to close the modal
        creation={creation}
        initialComments={creation.comments} // Pass comments to the modal
      />
    </>
  );
}

export default PromptCard;
