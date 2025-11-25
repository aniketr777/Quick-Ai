import React, { useState, useRef } from "react";
import { X, Heart, MessageCircle, Send, Copy, Download, Share2, Sparkles, Bot, Zap } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import Button from "./Button";
import Tag from "./Tag";
import UserAvatar from "./UserAvatar";
import ShareButton from "./ShareButton";

function CommentModal({
  isOpen,
  onClose,
  creation,
  comments,
  commentInput,
  setCommentInput,
  addComment,
  onLikeToggle,
}) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatRef = useRef(null);

  if (!isOpen) {
    return null;
  }
  const parseConcatenatedJSON = (data) => {
    let parsedArray = [];

    // Step 1: Normalize input into an array
    if (Array.isArray(data)) {
      parsedArray = data;
    } else if (typeof data === 'string') {
      try {
        if (data.includes('}{')) {
          // Handle concatenated JSON objects
          const formatString = data.replace(/}{/g, '},{');
          parsedArray = JSON.parse(`[${formatString}]`);
        } else {
          // Handle standard JSON string
          const parsed = JSON.parse(data);
          parsedArray = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (e) {
        console.error("Initial parse failed:", e);
        return [];
      }
    } else if (typeof data === 'object' && data !== null) {
      parsedArray = [data];
    }

    // Step 2: Deep Parse (The Critical Fix)
    // Ensure every item inside the array is an Object, not a String
    return parsedArray.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch (e) {
          console.error("Inner item parse failed:", e);
          return {}; // Return empty object to prevent crash
        }
      }
      return item;
    });
  };
  const parsedComments = parseConcatenatedJSON(comments);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput?.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await addComment();
    setIsSubmitting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(creation.prompt);
    toast.success("Prompt copied!");
  };

  const handleGemini = () => {
    navigator.clipboard.writeText(creation.prompt);
    window.open("https://gemini.google.com/", '_blank');
    toast.success("Prompt copied! Opening Gemini...");
  };

  const handleGPT = () => {
    navigator.clipboard.writeText(creation.prompt);
    window.open("https://chat.openai.com/", '_blank');
    toast.success("Prompt copied! Opening ChatGPT...");
  };



  const userDisplayName = creation.username || "Anonymous";
  const userImage = creation.user_img;
  const isLiked = user && creation.likes.includes(user.id);
  const tags = creation.tags || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-zinc-900 w-full max-w-6xl h-[85vh] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button Mobile */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* LEFT SIDE: Content Preview */}
        <div className="w-full md:w-3/5 lg:w-2/3 bg-black flex flex-col relative">
          {creation.type === "image" ? (
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 p-4 sm:p-10">
              <img
                src={creation.content}
                alt={creation.title || "Image"}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              {/* Bottom Action Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl max-w-[90%]">
                <Button
                  variant="gemini"
                  className="text-xs h-8"
                  onClick={handleGemini}
                >
                  <Sparkles size={14} /> Remix
                </Button>
                <div className="h-4 w-px bg-zinc-700"></div>
                <ShareButton
                  url={creation.content}
                  className="text-zinc-400 hover:text-white transition-colors"
                  iconSize={18}
                />
                <button
                  onClick={handleCopy}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <Copy size={18} />
                </button>
                <button
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
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-8 sm:p-16 overflow-y-auto custom-scrollbar">
              <div className="max-w-2xl w-full space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-sm font-medium">
                  <Zap size={14} /> Prompt
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight break-words">
                  {creation.title || creation.heading}
                </h2>
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sm:p-8 text-left relative group">
                  <p className="font-mono text-zinc-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere line-clamp-6">
                    {creation.prompt}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700 hover:text-white"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button
                    variant="gemini"
                    className="w-40"
                    onClick={handleGemini}
                  >
                    <Sparkles size={18}  /> Run with Gemini
                  </Button>
                  <Button variant="gpt" className="w-40" onClick={handleGPT}>
                    <Bot size={18} /> Run with GPT
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Details & Chat */}
        <div className="w-full md:w-2/5 lg:w-1/3 bg-zinc-900 flex flex-col border-l border-zinc-800">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 z-10">
            <div className="flex items-center gap-3">
              <UserAvatar url={userImage} name={userDisplayName} size="md" />
              <div>
                <h3 className="font-bold text-white text-base">
                  {userDisplayName}
                </h3>
                <p className="text-xs text-zinc-500">
                  @{userDisplayName.toLowerCase().replace(/\s+/g, "_")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hidden md:flex p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content Area: Info + Comments */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Item Details */}
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-white">
                  {creation.title || creation.heading}
                </h1>

                {creation.type === "image" && creation.prompt && (
                  <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                    <p className="text-sm text-zinc-300 font-mono leading-relaxed mb-3 break-words overflow-wrap-anywhere whitespace-pre-wrap line-clamp-4">
                      {creation.prompt}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={handleCopy}
                        className="text-xs h-8 px-3"
                      >
                        <Copy size={12} /> Copy Prompt
                      </Button>
                    </div>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <Tag key={i} text={tag} />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <div className="p-2 rounded-full bg-rose-500/10 text-rose-500">
                      <Heart
                        size={18}
                        className={isLiked ? "fill-current" : ""}
                      />
                    </div>
                    <span className="font-semibold text-white">
                      {creation.likes.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                      <MessageCircle size={18} />
                    </div>
                    <span className="font-semibold text-white">
                      {comments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-zinc-800 w-full" />

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Discussion
                </h3>

                <div className="space-y-3" ref={chatRef}>
                  {parsedComments && parsedComments.length > 0 ? (
                    parsedComments.map((comment, index) => (
                      <div
                        key={index}
                        className="flex gap-3 group p-3 rounded-xl hover:bg-zinc-800/30 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {comment.user_img ? (
                            <img
                              src={comment.user_img}
                              alt={comment.username || "User"}
                              className="w-9 h-9 rounded-full object-cover border-2 border-zinc-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-zinc-700">
                              {(comment.username || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-zinc-200">
                              {comment.username || "Anonymous"}
                            </span>
                            {comment.created_at && (
                              <span className="text-xs text-zinc-600">
                                {new Date(
                                  comment.created_at
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 mt-1 leading-relaxed break-words">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-zinc-500">
                      <MessageCircle
                        size={32}
                        className="mx-auto mb-3 opacity-30"
                      />
                      <p className="text-sm font-medium">No comments yet</p>
                      <p className="text-xs mt-1">
                        Be the first to share your thoughts!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900">
            <form onSubmit={handleCommentSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                  value={commentInput || ""}
                  onChange={(e) => setCommentInput(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!commentInput?.trim() || isSubmitting}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200 ${
                    commentInput?.trim()
                      ? "bg-orange-500 text-white"
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  <Send
                    size={16}
                    className={commentInput?.trim() ? "ml-0.5" : ""}
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;
