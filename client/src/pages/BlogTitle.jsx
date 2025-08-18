import { useState } from "react";
import { Edit, Sparkles, Hash } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

function BlogTitle() {
  const blogCategories = [
    "General",
    "Technology",
    "Business",
    "Health",
    "Lifestyle",
    "Education",
    "Travel",
    "Food",
  ];

  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

  const [selectedCategory, setSelectedCategory] = useState(blogCategories[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed");
        setLoading(false);
        return;
      }

      const prompt = `Write a Blog Title for ${input} in the category ${selectedCategory}`;
      const { data } = await axios.post(
        "/api/ai/generate-blog-title",
        { prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setContent(String(data.content).trim());
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex flex-col lg:flex-row gap-6 text-slate-700">
      {/* Left Form */}
      <form
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
        onSubmit={onSubmitHandler}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">AI Title Generator</h1>
        </div>

        {/* Keyword Input */}
        <p className="mt-6 text-sm font-medium">Keyword</p>
        <input
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The Future of Artificial Intelligence is ..."
          type="text"
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Category Selection */}
        <p className="mt-4 text-sm font-medium">Category</p>
        <div className="mt-4 flex gap-2 flex-wrap">
          {blogCategories.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 rounded-full cursor-pointer border ${
                selectedCategory === item
                  ? "bg-purple-50 text-purple-700 border-purple-300"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer 
            ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white"
            }`}
        >
          {loading ? (
            "Generating..."
          ) : (
            <>
              <Hash className="w-5" /> Generate Title
            </>
          )}
        </button>
      </form>

      {/* Right Generated Title */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[24rem]">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">Generated Title</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400 text-sm">
            <p>⏳ Generating your blog title...</p>
          </div>
        ) : content ? (
          <div className="mt-4 text-slate-700 text-base font-medium prose">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 text-gray-400 text-sm">
            <Hash className="w-9 h-9" />
            <p>Enter a keyword and click "Generate Title" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogTitle;
