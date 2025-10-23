import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

function CommentModal({
  isOpen,
  onClose,
  creation,
  onLikeToggle,
  initialComments,
}) {
  const { user } = useUser();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  // Resets comments when a new creation's modal is opened
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  if (!isOpen) {
    return null;
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObject = {
      id: Date.now(), // Temporary ID
      author: user?.fullName || "You",
      text: newComment,
    };
    setComments([...comments, newCommentObject]);
    setNewComment("");
    // TODO: Add API Call to save the comment
  };

  const userDisplayName = creation.username || "Anonymous";
  const userImage = creation.user_img;
  const isLiked = user && creation.likes.includes(user.id);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-300 hover:text-white z-10"
      >
        <X size={32} />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-5xl h-[85vh] flex rounded-lg overflow-hidden"
      >
        {/* --- Left Column: DYNAMIC Content Display --- */}
        <div className="w-1/2 bg-black flex justify-center items-center p-4">
          {creation.type === "prompt" ? (
            <div className="w-full text-white p-4">
              <h2 className="text-3xl font-bold mb-4">
                {creation.title || creation.heading}
              </h2>
              <p className="text-gray-300 leading-relaxed max-h-[70vh] overflow-y-auto">
                {creation.prompt}
              </p>
            </div>
          ) : (
            <img
              src={creation.content}
              alt="Creation"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* --- Right Column: Details & Comments --- */}
        <div className="w-1/2 flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b">
            {userImage ? (
              <img
                src={userImage}
                alt={userDisplayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-gray-800">
              {userDisplayName}
            </span>
          </div>

          <div className="flex-grow p-4 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 mb-4">
                  {/* Placeholder for commenter's image */}
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"></div>
                  <div className="text-sm">
                    <span className="font-bold mr-2">{comment.author}</span>
                    <span>{comment.text}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No comments yet.</p>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center gap-4 mb-3">
              <Heart
                onClick={() => onLikeToggle(creation.id)}
                className={`w-6 h-6 cursor-pointer ${
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-700"
                }`}
              />
              <MessageCircle className="w-6 h-6 text-gray-700" />
            </div>
            <p className="text-xs font-semibold mb-3">
              {creation.likes.length} likes
            </p>

            <form
              onSubmit={handleCommentSubmit}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;
