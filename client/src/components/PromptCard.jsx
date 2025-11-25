import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Copy, Sparkles, Eye } from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import CommentModal from "./CommentModal";
import ShareButton from "./ShareButton";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

function PromptCard({ creation, onLikeToggle, onCardClick }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  const userDisplayName = creation.username || "Anonymous";
  const userImage = creation.user_img;
  const isLiked = user && creation.likes.includes(user.id);
  const commentCount = comments.length || creation.comments?.length || 0;
  const tags = creation.tags || [];

  // Fetch comments when modal opens
  useEffect(() => {
    if (isModalOpen && creation.id) {
      fetchComments();
    }
  }, [isModalOpen, creation.id]);

  const fetchComments = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/ai/get-comments/${creation.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
    }
  };

  const addComment = async () => {
    if (!commentInput?.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentInput,
      username: user?.username || user?.firstName || "You",
      user_img: user?.imageUrl,
      userId: user?.id,
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setComments((prev) => [...prev, newComment]);
    setCommentInput("");

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/ai/add-comment",
        { promptId: creation.id, text: newComment.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        await fetchComments();
        toast.success("Comment added!");
      } else {
        setComments((prev) => prev.filter((c) => c.id !== newComment.id));
        toast.error(data.message);
      }
    } catch (e) {
      setComments((prev) => prev.filter((c) => c.id !== newComment.id));
      console.error("Error adding comment:", e);
      toast.error("Failed to add comment");
    }
  };

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(creation.prompt);
      setIsCopied(true);
      toast.success("Prompt copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleGemini = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(creation.prompt);
    window.open("https://gemini.google.com/", "_blank");
    toast.success("Prompt copied! Opening Gemini...");
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to like prompts");
      return;
    }
    onLikeToggle(creation.id);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(creation);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative w-full aspect-auto md:aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 flex flex-col"
      >
        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-amber-500" />

        <div className="p-4 md:p-6 flex flex-col h-full">
          {/* User Header */}
          <div className="flex items-center gap-3 mb-4">
            {userImage ? (
              <img
                src={userImage}
                alt={userDisplayName}
                className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm border-2 border-zinc-700">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {userDisplayName}
              </h3>
              {/* <p className="text-xs text-zinc-500">Shared a prompt</p> */}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative mb-4 overflow-hidden">
            <h4 className="text-lg md:text-xl font-bold text-zinc-100 mb-3 line-clamp-2 break-words">
              {creation.title || creation.heading}
            </h4>

            {/* Prompt Preview with better overflow handling */}
            <div className="max-h-[150px] md:max-h-[180px] overflow-y-auto custom-scrollbar">
              <p className="text-sm text-zinc-400 leading-relaxed font-mono bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 group-hover:border-zinc-700 transition-colors break-words overflow-wrap-anywhere whitespace-pre-wrap">
                {creation.prompt}
              </p>
            </div>

            {/* View Full Button Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-full flex items-center gap-1.5 border border-zinc-700">
                <Eye size={12} /> View Full
              </button>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 text-xs border border-zinc-700/50"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 text-xs border border-zinc-700/50">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors border border-zinc-700"
            >
              <Copy size={14} /> {isCopied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleGemini}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-medium transition-all"
            >
              <Sparkles size={14} /> Gemini
            </button>
            <ShareButton
              title={creation.title || creation.heading}
              text={creation.prompt}
              url={window.location.href} // Or specific creation URL if available
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors border border-zinc-700"
              iconSize={14}
            />
          </div>

          {/* Stats Footer */}
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-4 text-zinc-500 text-xs font-medium">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors hover:text-rose-400 ${isLiked ? "text-rose-500" : "text-zinc-500"
                }`}
            >
              <Heart
                size={16}
                className={`transition-all duration-300 ${isLiked ? "fill-rose-500 scale-110" : "group-hover:scale-110"
                  }`}
              />
              <span>{creation.likes.length}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={handleCommentClick}
              className="flex items-center gap-1.5 transition-colors hover:text-blue-400"
            >
              <MessageCircle
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              <span>{commentCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render the modal */}
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        creation={creation}
        comments={comments}
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        addComment={addComment}
        onLikeToggle={onLikeToggle}
      />
    </>
  );
}

export default PromptCard;
