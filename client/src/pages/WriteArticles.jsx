import { useState } from "react";
import { Edit, Sparkles } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import ReactMarkdown from "react-markdown"; // 👈 import markdown renderer

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

function WriteArticles() {
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Large (1200-1600 words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
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

      const prompt = `Write an article about ${input} in around ${selectedLength.length} words`;

      const { data } = await axios.post(
        "/api/ai/generate-article",
        { prompt, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // 🛠 ensure ReactMarkdown always gets a clean string
        setContent(String(data.content).trim());
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }

    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex flex-col lg:flex-row gap-6 text-slate-700">
      {/* Left Form */}
      <form
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
        onSubmit={onSubmitHandler}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>

        {/* Topic Input */}
        <p className="mt-6 text-sm font-medium">Article Topic</p>
        <input
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The Future of artificial intelligence is ..."
          type="text"
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Article Length */}
        <p className="mt-4 text-sm font-medium">Article Length</p>
        <div className="mt-4 flex gap-2 flex-wrap">
          {articleLength.map((item, index) => (
            <span
              key={index}
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 rounded-full cursor-pointer border ${
                selectedLength.text === item.text
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {item.text}
            </span>
          ))}
        </div>

        {/* Submit Button */}
        <button
          disabled={loading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Edit className="w-5" />
          )}
          Generate Article
        </button>
      </form>

      {/* Right Generated Article */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[24rem] max-h-[600px]">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Generated Article</h1>
        </div>

        {!content ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 text-gray-400 text-sm">
            <Edit className="w-9 h-9" />
            <p>Enter a topic and click "Generate Article" to get started</p>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600 prose">
            <div className="reset-tw ">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WriteArticles;
