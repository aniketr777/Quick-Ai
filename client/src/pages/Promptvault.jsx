import { useState, useEffect } from "react";
import {
  MessageSquareText,
  Save,
  ThumbsUp,
  Pencil,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

function PromptVault() {
  const tags = [
    "Algorithms",
    "Data Structures",
    "Web Development",
    "Mobile Development",
    "Machine Learning",
    "Artificial Intelligence",
    "Cybersecurity",
    "Cloud Computing",
    "Database Management",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
    "Data Science",
    "Competitive Programming",
    "DevOps",
    "Backend",
    "Frontend",
    "Full Stack",
    "Game Development",
    "Embedded Systems",
    "UI/UX Design",
    "Blockchain",
    "IoT",
    "Robotics",
    "UX",
    "UI",
    "Other",
  ];

  const [isPublic, setIsPublic] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [heading, setHeading] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);

  const { getToken, userId } = useAuth();

  const handleTagClick = (tagToToggle) => {
    setSelectedTags((prev) =>
      prev.includes(tagToToggle)
        ? prev.filter((tag) => tag !== tagToToggle)
        : [...prev, tagToToggle]
    );
  };

  const handleSavePrompt = async (e) => {
    e.preventDefault();
    if (!promptContent || !heading || selectedTags.length === 0) {
      toast.error("Please fill heading, prompt, and select at least one tag.");
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      let url = "/api/ai/create-prompt";
      let method = "post";
      let payload = {
        heading,
        prompt: promptContent,
        tags: selectedTags,
        isPublic,
        type: "prompt",
      };

      if (editingPrompt) {
        url = `/api/ai/edit-prompt/${editingPrompt.id}`; // ✅ matches backend route
        method = "put";
      }

      const { data } = await axios({
        url,
        method,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(editingPrompt ? "Prompt updated!" : "Prompt saved!");
        setHeading("");
        setPromptContent("");
        setSelectedTags([]);
        setIsPublic(false);
        setEditingPrompt(null);
        getPrompts();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.error("Error saving prompt:", e);
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const getPrompts = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/get-user-prompts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setPrompts(data.creations || []);
      }
    } catch (e) {
      console.error("Error fetching prompts:", e);
    }
  };

  const handleLikes = async (promptId) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === promptId
          ? {
              ...p,
              likes: p.likes.includes(userId)
                ? p.likes.filter((id) => id !== userId)
                : [...p.likes, userId],
            }
          : p
      )
    );
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `/api/ai/like-prompt`,
        { promptId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) getPrompts();
    } catch (e) {
      console.error("Error liking prompt:", e);
      getPrompts();
    }
  };

  const handleDelete = async (promptId) => {
    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/ai/delete-prompt/${promptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Prompt deleted!");
        setPrompts((prev) => prev.filter((p) => p.id !== promptId));
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.error("Error deleting prompt:", e);
      toast.error(e?.response?.data?.message || e.message);
    }
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setHeading(prompt.title);
    setPromptContent(prompt.prompt);
    setSelectedTags(prompt.tags || []);
    setIsPublic(prompt.is_public || false);
    window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ scrolls to form
  };

  useEffect(() => {
    getPrompts();
  }, []);

  const TAG_LIMIT = 8;
  const tagsToShow = showAllTags ? tags : tags.slice(0, TAG_LIMIT);

  return (
    <div className="h-full p-6 flex flex-col lg:flex-row gap-6 text-slate-700">
      {/* Form */}
      <form
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
        onSubmit={handleSavePrompt}
      >
        <div className="flex items-center gap-3">
          <MessageSquareText className="w-6 text-red-500" />
          <h1 className="text-xl font-semibold text-black">
            {editingPrompt ? "Edit Prompt" : "Save a New Prompt"}
          </h1>
        </div>

        <p className="mt-6 text-sm font-medium">Heading</p>
        <input
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="e.g., Business Plan Generator"
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          required
        />

        <p className="mt-4 text-sm font-medium">Prompt Content</p>
        <textarea
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 h-48"
          placeholder="Write your prompt here..."
          value={promptContent}
          onChange={(e) => setPromptContent(e.target.value)}
          required
        />

        <p className="mt-4 text-sm font-medium">Tags</p>
        <div className="mt-4 flex gap-2 flex-wrap">
          {tagsToShow.map((tag) => (
            <span
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`text-xs px-4 py-1 rounded-full cursor-pointer border ${
                selectedTags.includes(tag)
                  ? "bg-orange-50 text-orange-700 border-orange-300"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {tags.length > TAG_LIMIT && (
          <button
            type="button"
            onClick={() => setShowAllTags(!showAllTags)}
            className="text-sm text-blue-600 hover:underline mt-2 font-medium"
          >
            {showAllTags
              ? "Show Less"
              : `Show More (${tags.length - TAG_LIMIT})`}
          </button>
        )}

        <p className="mt-6 text-sm font-medium">Visibility</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
                className="sr-only"
              />
              <div
                className={`w-10 h-5 rounded-full transition-colors ${
                  isPublic ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <div
                className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  isPublic ? "translate-x-5" : ""
                }`}
              />
            </div>
            <span className="text-sm text-gray-700">
              Make this prompt Public
            </span>
          </label>
        </div>

        {editingPrompt && (
          <button
            type="button"
            onClick={() => {
              setEditingPrompt(null);
              setHeading("");
              setPromptContent("");
              setSelectedTags([]);
              setIsPublic(false);
            }}
            className="text-xs text-gray-500 mt-2 hover:underline"
          >
            Cancel Editing
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 mt-6 text-sm rounded-lg 
            ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#FF4500] to-[#FF6347] text-white"
            }`}
        >
          {loading ? (
            editingPrompt ? (
              "Updating..."
            ) : (
              "Saving..."
            )
          ) : (
            <>
              <Save className="w-5" />
              {editingPrompt ? "Update Prompt" : "Save Prompt"}
            </>
          )}
        </button>
      </form>

      {/* Saved Prompts */}
      <div className="border border-gray-100 p-4 rounded-lg w-full max-w-xl bg-white flex flex-col">
        <h2 className="text-lg font-semibold text-black mb-3">Your Prompts</h2>

        <div className="flex-1 overflow-y-auto max-h-[70vh] pr-2">
          {prompts.length === 0 ? (
            <p className="text-gray-500 text-sm">No prompts saved yet.</p>
          ) : (
            prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="border border-gray-200 rounded-lg p-3 mb-3 hover:bg-gray-50 transition"
              >
                <span className="block text-lg font-semibold text-black">
                  {prompt.heading || prompt.title}
                </span>
                <span className="block text-sm text-gray-700">
                  {prompt.prompt}
                </span>

                <div className="mt-3 flex items-center justify-between">
                  <div
                    className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer"
                    onClick={() => handleLikes(prompt.id)}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {prompt.likes?.length || 0} Likes
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <button
                      onClick={() => handleEdit(prompt)}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="flex items-center gap-1 text-red-600 hover:underline"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PromptVault;
