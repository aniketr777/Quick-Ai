import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Heart, Download } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

function Community() {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

  const fetchCreation = async () => {
    try {
      const { data } = await axios.get("/api/user/getPublishedCreations", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        const formattedCreations = data.creations.map((c) => ({
          ...c,
          likes: Array.isArray(c.likes)
            ? c.likes
            : c.likes
                ?.replace(/[{}]/g, "")
                .split(",")
                .map((s) => s.trim()) || [],
        }));
        setCreations(formattedCreations);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const imageLikeToggle = async (id) => {
    // Optimistic UI update
    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isLiked = c.likes.includes(user?.id);
          return {
            ...c,
            likes: isLiked
              ? c.likes.filter((uid) => uid !== user?.id)
              : [...c.likes, user?.id],
          };
        }
        return c;
      })
    );

    try {
      const { data } = await axios.post(
        "/api/user/toggle-like-creation",
        { id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (!data.success) {
        toast.error(data.message);
        await fetchCreation(); // revert if server fails
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
      await fetchCreation(); // revert on error
    }
  };



  useEffect(() => {
    if (user) fetchCreation();
  }, [user]);

  const handleDownload = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `creation-${Date.now()}.jpg`;
    link.click();
  };

  return !loading ? (

    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <h2 className="text-xl font-semibold">Creations</h2>
      <div className="bg-white h-full w-full rounded-xl overflow-y-scroll grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-3">
        {creations.map((creation, index) => (
          <div
            key={index}
            className="relative group w-full rounded-lg overflow-hidden"
          >
            <img
              className="w-full h-60 object-cover rounded-lg"
              src={creation.content}
              alt="Creation"
            />
            <div className="absolute top-0 left-0 p-3 bg-black/50 text-white font-semibold">
              {creation.user_id || "Anonymous"}
            </div>
            <div className="absolute inset-0 flex items-end justify-between p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition">
              <div className="flex items-center gap-2">
                <p className="text-white text-sm">{creation.likes.length}</p>
                <Heart
                  onClick={() => imageLikeToggle(creation.id)}
                  className={`w-5 h-5 cursor-pointer hover:scale-110 transition ${
                    creation.likes.includes(user?.id)
                      ? "fill-red-500 text-red-600"
                      : "text-white"
                  }`}
                />
              </div>
              <Download
                className="w-5 h-5 text-white cursor-pointer hover:scale-110 transition"
                onClick={() => handleDownload(creation.content)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ) :(
    <div className="flex justify-center items-center h-full ">
      <span className="w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin"></span>
    </div>
  ) ;
}

export default Community;
