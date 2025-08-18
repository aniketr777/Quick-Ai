import { useState } from "react";
import { Edit, Sparkles, FileText } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import ReactMarkdown from "react-markdown";

function ReviewResume() {
  const [input, setInput] = useState("");
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const { getToken } = useAuth();

  const onSubmitHandler = async(e) => {
    e.preventDefault();
    if (!input) return alert("Please select a file!");
    console.log("Uploaded file:", input);
    // You can add upload logic here
        try {
      setLoading(true);


      const token = await getToken();
      const formData = new FormData();
      formData.append("resume", input);

      // const finalPrompt = `Generate an image for ${prompt} in the style of ${selectedStyle}`;

      const { data } = await axios.post(
        "/api/ai/generate-resume-review",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Response data:", data);
      if (data.success) {
        setContent(data.content);
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
          <Sparkles className="w-6 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Resume Reviewer</h1>
        </div>
        {/* File Input */}
        <p className="mt-6 text-sm font-medium">Upload your resume</p>
        <input
          className="w-full mt-2"
          type="file"
          accept=".pdf"
          required
          onChange={(e) => setInput(e.target.files[0])}
        />
        <p className="text-xs text-gray-500 font-light mt-1 ">
          Supports PDF resume only.
        </p>
        {/* Submit Button */}
        <button
          disabled={loading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <FileText className="w-5" />
          )}
          Review Resume
        </button>
      </form>

      {/* Right Preview / Message */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-[24rem]">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Review Status</h1>
        </div>


        {
          !content ? (
        <div className="flex flex-col items-center justify-center ">
          <div className="text-sm flex flex-col  items-center gap-5 text-gray-400">
            <FileText className="w-9 h-9 ">
              <p>Upload a resume and click "Review Resume" to get started"</p>
            </FileText>
          </div>
          
        </div>
          ) : (
            <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
              <div className="reset-tw">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          )
        }

      </div>
    </div>
  );
}

export default ReviewResume;
