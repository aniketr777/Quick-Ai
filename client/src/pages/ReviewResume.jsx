import { useState } from "react";
import {
  FileText,
  Sparkles,
  RefreshCw,
  Check,
  UploadCloud,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Tag as TagIcon,
  Zap
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

function ReviewResume() {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { getToken } = useAuth();

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

   const handleAnalyze = async () => {
      if (!file) return;
      setIsAnalyzing(true);

      try {
         const token = await getToken();
         const formData = new FormData();
         formData.append("resume", file);

         const { data } = await axios.post(
            "/api/ai/generate-resume-review",
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
         );

         if (data.success) {
            setResult({
               score: data.score,
               atsCompatible: data.atsCompatible,
               content: data.content,
               strengths: data.strengths,
               weaknesses: data.weaknesses,
               keywords: data.keywords,
            });

            toast.success("Resume analyzed successfully!");
         } else {
            toast.error(data.message);
         }
      } catch (e) {
         console.error("Error:", e);
         toast.error(e?.response?.data?.message || e.message);
      } finally {
         setIsAnalyzing(false);
      }
   };


  const resetAnalysis = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-8rem)] min-h-[700px] flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-8">
      
      {/* LEFT: Upload Panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden relative">
           
           {/* Decorative Top Gradient */}
           <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

           {/* Header */}
           <div className="p-8 border-b border-zinc-800/50 bg-zinc-900">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-xl text-teal-400 border border-teal-500/20">
                    <FileText size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-white">Resume Reviewer</h2>
                    <p className="text-xs text-zinc-500 mt-1">Get AI-powered feedback on your CV.</p>
                 </div>
              </div>
           </div>

           {/* Upload Content */}
           <div className="p-8 flex-1 flex flex-col justify-center items-center">
              {!file ? (
                <div 
                  className={`w-full h-full min-h-[300px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                    isDragging 
                      ? 'border-teal-500 bg-teal-500/5 scale-[0.99]' 
                      : 'border-zinc-700 bg-zinc-950/30 hover:border-zinc-600 hover:bg-zinc-900'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                   <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-xl">
                      <UploadCloud size={32} className="text-teal-500" />
                   </div>
                   <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-white">Upload your resume</h3>
                      <p className="text-sm text-zinc-500 max-w-xs">Drag and drop your PDF here, or click to browse.</p>
                   </div>
                   <label className="cursor-pointer">
                      <input type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                      <span className="px-6 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 hover:text-white transition-colors">Choose File</span>
                   </label>
                   <p className="text-xs text-zinc-600 mt-4">Supports PDF resume only.</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 duration-300">
                   <div className="w-24 h-32 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center relative shadow-2xl">
                      <FileText size={48} className="text-zinc-500" />
                      <div className="absolute -top-2 -right-2 bg-teal-500 rounded-full p-1 border-4 border-zinc-900">
                         <Check size={14} className="text-white" />
                      </div>
                   </div>
                   <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-1">{file.name}</h3>
                      <p className="text-sm text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                   </div>
                   
                   <div className="flex gap-3 w-full max-w-md">
                      <button 
                        onClick={resetAnalysis}
                        className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition-colors"
                      >
                        Replace
                      </button>
                      <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent text-base font-semibold"
                      >
                        {isAnalyzing ? (
                           <span className="flex items-center gap-2">
                              <RefreshCw size={18} className="animate-spin" /> Reviewing...
                           </span>
                        ) : (
                           <span className="flex items-center gap-2">
                              <Zap size={18} /> Review Resume
                           </span>
                        )}
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* RIGHT: Result Panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden relative">
           
           <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
              {result && <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-medium border border-teal-500/20">Completed</span>}
           </div>

           <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-zinc-950/30 relative">
              {isAnalyzing ? (
                 <div className="h-full flex flex-col items-center justify-center gap-6">
                    <div className="relative w-32 h-32">
                       <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-t-teal-500 rounded-full animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Search size={32} className="text-teal-500 animate-pulse" />
                       </div>
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-xl font-bold text-white">Scanning your resume...</h3>
                       <p className="text-zinc-500 text-sm animate-pulse">Checking for ATS compatibility and keywords</p>
                    </div>
                 </div>
              ) : !result ? (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-6">
                    <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-800">
                       <FileText size={40} className="opacity-20" />
                    </div>
                    <div className="text-center max-w-sm">
                       <p className="text-lg font-medium text-zinc-300">Ready to Analyze</p>
                       <p className="text-sm mt-2 leading-relaxed">Upload your resume on the left to get detailed insights, ATS scoring, and improvement suggestions.</p>
                    </div>
                 </div>
              ) : (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Score Cards */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center">
                          <div className="text-4xl font-bold text-white mb-1">{result.score}</div>
                          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Overall Score</div>
                       </div>
                       <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center">
                          <div className={`text-lg font-bold mb-1 ${result.atsCompatible ? 'text-emerald-400' : 'text-red-400'}`}>
                             {result.atsCompatible ? 'Passed' : 'Failed'}
                          </div>
                          <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">ATS Check</div>
                       </div>
                    </div>

                    {/* Full AI Response */}
                    {result.content && (
                      <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                          <Sparkles size={16} className="text-teal-400" /> AI Analysis
                        </h4>
                        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono bg-zinc-950/50 p-4 rounded-lg border border-zinc-800/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {result.content}
                        </div>
                      </div>
                    )}

                    {/* Strengths & Weaknesses */}
                    <div className="grid gap-4">
                       <div className="bg-zinc-900/50 rounded-xl p-5 border border-emerald-500/10">
                          <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2"><TrendingUp size={16} /> Strengths</h4>
                          <ul className="space-y-2">
                             {result.strengths.map((s, i) => (
                                <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                                   <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                   {s}
                                </li>
                             ))}
                          </ul>
                       </div>

                       <div className="bg-zinc-900/50 rounded-xl p-5 border border-orange-500/10">
                          <h4 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2"><AlertTriangle size={16} /> Improvements</h4>
                          <ul className="space-y-2">
                             {result.weaknesses.map((w, i) => (
                                <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                                   <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                                   {w}
                                </li>
                             ))}
                          </ul>
                       </div>
                    </div>

                    {/* Keywords */}
                    <div>
                       <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><TagIcon size={14} /> Detected Keywords</h4>
                       <div className="flex flex-wrap gap-2">
                          {result.keywords.map((k, i) => (
                             <span key={i} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">{k}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>

    </div>
  );
}

export default ReviewResume;
