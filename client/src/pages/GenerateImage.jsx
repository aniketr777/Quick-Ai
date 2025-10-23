import { useState } from "react";
import { Image, Sparkles, AlertTriangle } from "lucide-react";
import { Protect } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

function GenerateImage() {
  const imageStyles = [
    "Original",
    "Fantasy Style",
    "Realistic",
    "Ghibli Style",
    "3D Style",
    "Anime Style",
    "Portrait Style",
    "Cartoon Style",
  ];

  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [warning, setWarning] = useState(""); // New warning state
  const { getToken } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(imageStyles[0]);
  const [isPublic, setIsPublic] = useState(true);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setWarning(""); // Reset warning
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed");
        setLoading(false);
        return;
      }

      const finalPrompt = `Generate an image for ${prompt} in the style of ${selectedStyle}`;
      const { data } = await axios.post(
        "/api/ai/generate-image",
        { prompt: finalPrompt, publish: isPublic },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setContent(String(data.secure_url).trim());
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      // Show warning if API rejects prompt
      if (e?.response?.status === 422) {
        setWarning(
          "⚠️ The prompt may contain inappropriate content. Please try a safe prompt."
        );
      } else {
        toast.error(e?.response?.data?.message || e.message);
      }
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
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#F97316]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Image Prompt</p>
        <textarea
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="A cozy cabin in the forest with glowing windows..."
          required
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
        />

        <p className="mt-4 text-sm font-medium">Image Style</p>
        <div className="mt-4 flex gap-2 flex-wrap">
          {imageStyles.map((style) => (
            <span
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`text-xs px-4 py-1 rounded-full cursor-pointer border ${
                selectedStyle === style
                  ? "bg-orange-50 text-orange-700 border-orange-300"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              {style}
            </span>
          ))}
        </div>

        <p className="mt-6 text-sm font-medium">Visibility</p>
        <div className="flex items-center gap-3">
          <Protect
            plan="premium"
            fallback={
              <>
                <div className="flex items-center gap-2">
                  <div className="relative inline-flex items-center cursor-not-allowed">
                    <div className="w-10 h-5 bg-green-400 rounded-full opacity-60" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform" />
                  </div>
                  <span className="text-sm text-gray-700">
                    Make this image Public
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  All images are public on free plan
                </span>
              </>
            }
          >
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
                Make this image Public
              </span>
            </label>
          </Protect>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin" />
          ) : (
            <Image className="w-5" />
          )}
          Generate Image
        </button>
      </form>

      {/* Right Panel */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[24rem]">
        <div className="flex items-center gap-3">
          <Image className="w-5 h-5 text-[#F97316]" />
          <h1 className="text-xl font-semibold">Generated Image</h1>
        </div>

        {/* ⚠️ Warning Message */}
        {warning && (
          <div className="flex items-center gap-2 mt-3 text-orange-600 text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            {warning}
          </div>
        )}

        {!content ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 text-gray-400 text-sm mt-3">
            <Image className="w-9 h-9" />
            <p>Enter a prompt, choose a style, and click "Generate Image"</p>
          </div>
        ) : (
          <div className="mt-3 h-full">
            <img src={content} className="w-full h-full" alt="image" />
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerateImage;
