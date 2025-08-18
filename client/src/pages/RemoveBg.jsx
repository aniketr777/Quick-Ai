import { useState } from "react";
import { Eraser, Sparkles } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

function RemoveBg() {
  const [input, setInput] = useState("");
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", input);

      // const finalPrompt = `Generate an image for ${prompt} in the style of ${selectedStyle}`;

      const { data } = await axios.post(
        "/api/ai/generate-image-backgorund",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Response data:", data);
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
          <Sparkles className="w-6 text-green-500" />
          <h1 className="text-xl font-semibold text-green-700">
            AI Background Remover
          </h1>
        </div>

        {/* Keyword Input */}
        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border text-gray-600 border-gray-300"
          type="file"
          required
          accept="image/*"
          onChange={(e) => setInput(e.target.files[0])}
        />
        <p className="text-xs text-gray-500 font-light mt-1">
          Supports JPG, PNG, and other image formats
        </p>

        {/* Submit Button */}
        <button
          disabled={loading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Eraser className="w-5" />
          )}
          Remove Background
        </button>
      </form>

      {/* Right Processed Image */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[24rem]">
        <div className="flex items-center gap-3">
          <Eraser className="w-5 h-5 text-green-600" />
          <h1 className="text-xl font-semibold text-green-700">
            Processed Image
          </h1>
        </div>
        {!content ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 text-gray-400 text-sm">
            <Eraser className="w-9 h-9 text-green-400" />
            <p>Upload an image and click "Remove Background" to get started</p>
          </div>
        ) : (
          <img src={content} alt="image" className="w-full h-full mt-3  " />
        )}
        <div>{content}</div>
      </div>
    </div>
  );
}

export default RemoveBg;
