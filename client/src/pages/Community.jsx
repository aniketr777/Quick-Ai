import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-hot-toast";

import ImageCard from "../components/ImageCard";
import PromptCard from "../components/PromptCard";
import CommentModal from "../components/CommentModal";

function Community() {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [activeFilter, setActiveFilter] = useState('newest'); // Changed default to 'newest' to likely show more items

  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

  const fetchCreations = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      // FIX: Passing the activeFilter to the backend
      const { data } = await axios.get("/api/user/published-creations", {
        headers: { Authorization: `Bearer ${token}` },
        params: { filter: activeFilter, limit: 100 } // Requesting a higher limit
      });

      if (data.success) {
        const formattedCreations = data.creations.map((c) => {
          let likesArray = [];
          if (Array.isArray(c.likes)) {
            likesArray = c.likes;
          } else if (c.likes) {
            const cleanedLikes = c.likes.replace(/[{}]/g, "").trim();
            if (cleanedLikes)
              likesArray = cleanedLikes.split(",").map((s) => s.trim());
          }
          return { ...c, likes: likesArray, comments: c.comments || [] };
        });
        setCreations(formattedCreations);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.error("Fetch error:", e);
      toast.error(e?.response?.data?.message || "Failed to load creations");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (id) => {
    // Optimistic update
    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isLiked = c.likes.includes(user?.id);
          const newLikes = isLiked
            ? c.likes.filter((uid) => uid !== user?.id)
            : [...c.likes, user?.id];
          return { ...c, likes: newLikes };
        }
        return c;
      })
    );

    try {
      const { data } = await axios.post(
        "/api/user/toggle-like",
        { id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (!data.success) {
        toast.error(data.message);
        await fetchCreations(); // Revert on failure
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
      await fetchCreations();
    }
  };

  const fetchComments = async (creationId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/ai/get-comments/${creationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success)
        setComments((prev) => ({ ...prev, [creationId]: data.comments }));
    } catch (e) {
      console.error("Error fetching comments:", e);
    }
  };

  const addComment = async (creationId) => {
    if (!commentInput[creationId]?.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentInput[creationId],
      username: user?.username || user?.firstName || "You",
      user_img: user?.imageUrl,
      userId: user?.id,
      created_at: new Date().toISOString()
    };

    // Optimistic update
    setComments((prev) => ({
      ...prev,
      [creationId]: [...(prev[creationId] || []), newComment]
    }));
    setCommentInput((prev) => ({ ...prev, [creationId]: "" }));

    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/ai/add-Comment",
        { promptId: creationId, text: newComment.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        await fetchComments(creationId);
        toast.success("Comment added!");
      } else {
        setComments((prev) => ({
          ...prev,
          [creationId]: (prev[creationId] || []).filter(c => c.id !== newComment.id)
        }));
        toast.error(data.message);
      }
    } catch (e) {
      setComments((prev) => ({
        ...prev,
        [creationId]: (prev[creationId] || []).filter(c => c.id !== newComment.id)
      }));
      console.error("Error adding comment:", e);
      toast.error("Failed to add comment");
    }
  };

  // FIX: Added activeFilter to dependency array
  useEffect(() => {
    if (user) fetchCreations();
  }, [user, activeFilter]);

  useEffect(() => {
    if (selectedCreation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedCreation]);

  // const handleDownload = (imageUrl) => {
  //   const link = document.createElement("a");
  //   link.href = imageUrl;
  //   link.download = `creation-${Date.now()}.png`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const handleCardClick = async (creation) => {
    setSelectedCreation(creation);
    await fetchComments(creation.id);
  };

  const handleCloseModal = () => {
    setSelectedCreation(null);
  };

  if (loading && creations.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-zinc-950">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Community Showcase</h1>
            <p className="text-zinc-400 max-w-lg">
              Explore and remix thousands of top AI-generated images and prompts from our creative community.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveFilter('trending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${activeFilter === 'trending'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
                }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveFilter('newest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'newest'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
                }`}
            >
              Newest
            </button>
            <button
              onClick={() => setActiveFilter('top')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'top'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
                }`}
            >
              Top
            </button>
          </div>
        </div>

        {/* Grid Feed */}
        {creations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">No creations yet</h3>
            <p className="text-zinc-400">Be the first to share your creation with the community!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creations.map((creation) => (
              <React.Fragment key={creation.id}>
                {creation.type === 'image' ? (
                  <ImageCard
                    creation={creation}
                    onLikeToggle={handleLikeToggle}
                    // onDownload={handleDownload}
                    onCardClick={handleCardClick}
                  />
                ) : (
                  <PromptCard
                    creation={creation}
                    onLikeToggle={handleLikeToggle}
                    onCardClick={handleCardClick}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

      </main>

      {/* Modal Overlay */}
      {selectedCreation && (
        <CommentModal
          isOpen={!!selectedCreation}
          onClose={handleCloseModal}
          creation={selectedCreation}
          comments={comments[selectedCreation.id] || []}
          commentInput={commentInput[selectedCreation.id] || ""}
          setCommentInput={(text) =>
            setCommentInput((prev) => ({
              ...prev,
              [selectedCreation.id]: text,
            }))
          }
          addComment={() => addComment(selectedCreation.id)}
          onLikeToggle={handleLikeToggle}
        />
      )}
    </div>
  );
}

export default Community;