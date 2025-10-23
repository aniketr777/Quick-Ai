import { useEffect, useState } from "react";
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

  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get("/api/user/published-creations", {
        headers: { Authorization: `Bearer ${await getToken()}` },
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
      } else toast.error(data.message);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (id) => {
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
        await fetchCreations();
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
    if (!commentInput[creationId]) return;
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/ai/add-Comment",
        { promptId: creationId, text: commentInput[creationId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setCommentInput((prev) => ({ ...prev, [creationId]: "" }));
        fetchComments(creationId);
      }
    } catch (e) {
      console.error("Error adding comment:", e);
    }
  };

  useEffect(() => {
    if (user) fetchCreations();
  }, [user]);

  const handleDownload = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `creation-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCardClick = async (creation) => {
    setSelectedCreation(creation);
    await fetchComments(creation.id);
  };

  const handleCloseModal = () => {
    setSelectedCreation(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800">Community Creations</h2>
      <div className="flex-1 w-full overflow-auto overflow-y-hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
        {creations.map((creation) =>
          creation.type === "prompt" ? (
            <PromptCard
              key={creation.id}
              creation={creation}
              onLikeToggle={handleLikeToggle}
              onCardClick={handleCardClick}
            />
          ) : (
            <ImageCard
              key={creation.id}
              creation={creation}
              onLikeToggle={handleLikeToggle}
              onDownload={handleDownload}
              onCardClick={handleCardClick}
            />
          )
        )}
      </div>

      {/* Comment Modal */}
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
        />
      )}
    </div>
  );
}

export default Community;
