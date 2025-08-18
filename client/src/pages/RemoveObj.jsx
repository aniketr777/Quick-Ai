import React, { useState } from "react";
import { Scissors, Sparkles } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

function RemoveObj() {
  const [input, setInput] = useState("");
  const [object, setObject] = useState("");

  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (object.split(" ").length > 1) {
        return toast("Please enter only one object name");
      }

      const token = await getToken();
      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", object);

      const { data } = await axios.post(
        "/api/ai/generate-image-object",
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
            Object Removal
          </h1>
        </div>

        {/* Upload Image */}
        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setInput(e.target.files[0])}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
        />

        {/* Describe Object */}
        <p className="mt-4 text-sm font-medium">Describe object to remove</p>
        <textarea
          placeholder="e.g., car in background, tree in the image"
          value={object}
          onChange={(e) => setObject(e.target.value)}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 resize-none"
        />
        <p className=" text-xs text-gray-400">
          {" "}
          Be Specific about what you want to remove{" "}
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
            <Scissors className="w-5" />
          )}
          Remove Object
        </button>
      </form>

      {/* Right Processed Image */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[24rem]">
        <div className="flex items-center gap-3">
          <Scissors className="w-5 h-5 text-green-600" />
          <h1 className="text-xl font-semibold text-green-700">
            Processed Image
          </h1>
        </div>
        {!content ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 text-gray-400 text-sm">
            <Scissors className="w-9 h-9 text-green-400" />
            <p>
              Upload an image and describe the object to remove to get started
            </p>
          </div>
        ) : (
          <img src={content} alt="image" className="w-full h-full mt-3  " />
        )}
      </div>
    </div>
  );
}

export default RemoveObj;
