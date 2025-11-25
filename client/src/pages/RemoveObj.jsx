import { useState } from "react";
import {
  Scissors,
  RefreshCw,
  X,
  Image as ImageIcon,
  Sparkles,
  Eraser,
  DownloadCloud,
  ArrowRightLeft,
  Type,
  Brush,
  MousePointer2
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

function RemoveObj() {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [mode, setMode] = useState("describe"); // 'describe' or 'brush'
  const { getToken } = useAuth();

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setOriginalPreview(URL.createObjectURL(droppedFile));
    } else {
      toast.error("Please upload an image file");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemove = async () => {
    if (!file || !description) {
      toast.error("Please upload an image and describe the object to remove");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", file);
      formData.append("object", description);

      const { data } = await axios.post(
        "/api/ai/generate-image-object",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setResultImage(String(data.content).trim());
        toast.success("Object removed successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.error("Error removing object:", e);
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResultImage(null);
    setDescription("");
    setShowOriginal(false);
    setOriginalPreview(null);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'object-removed.png';
    link.click();
  };

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-8rem)] min-h-[700px] flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-8">
      
      {/* LEFT: Control Panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden relative">
           
           {/* Decorative Gradient */}
           <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500" />

           {/* Header */}
           <div className="p-8 border-b border-zinc-800/50 bg-zinc-900">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-xl text-rose-400 border border-rose-500/20">
                    <Scissors size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-white">Object Removal</h2>
                    <p className="text-xs text-zinc-500 mt-1">Magically erase unwanted elements.</p>
                 </div>
              </div>
           </div>

           {/* Content */}
           <div className="p-8 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
              
              {/* File Upload */}
              {!file ? (
                <div 
                  className={`w-full min-h-[200px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                    isDragging ? 'border-rose-500 bg-rose-500/5' : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('obj-upload').click()}
                >
                   <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                      <ImageIcon size={20} className="text-rose-500" />
                   </div>
                   <div className="text-center">
                      <p className="text-sm font-medium text-zinc-300">Click to Upload</p>
                      <p className="text-xs text-zinc-600 mt-1">JPG, PNG (Max 10MB)</p>
                   </div>
                   <input id="obj-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-700 group">
                   <img src={originalPreview} alt="Preview" className="w-full h-full object-cover" />
                   <button onClick={reset} className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors">
                      <X size={14} />
                   </button>
                </div>
              )}

              {/* Input Method Toggle */}
              <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                 <button 
                    onClick={() => setMode('describe')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'describe' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                 >
                    <Type size={14} /> Describe
                 </button>
                 <button 
                    onClick={() => setMode('brush')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${mode === 'brush' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                 >
                    <Brush size={14} /> Brush Selection
                 </button>
              </div>

              {/* Description Input */}
              {mode === 'describe' ? (
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Describe object to remove</label>
                    <textarea 
                       value={description}
                       onChange={(e) => setDescription(e.target.value)}
                       placeholder="e.g., red car in the background, person on the left..." 
                       className="w-full h-28 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all resize-none"
                    />
                 </div>
              ) : (
                 <div className="h-28 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 gap-2">
                    <MousePointer2 size={24} className="opacity-20" />
                    <p className="text-xs">Interactive brushing is disabled in preview.</p>
                 </div>
              )}

              {/* Action Button */}
              <div className="mt-auto pt-4">
                 <button 
                    onClick={handleRemove}
                    disabled={isProcessing || !file || (!description && mode === 'describe')}
                    className="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:shadow-rose-500/20 border border-transparent text-base font-semibold"
                 >
                    {isProcessing ? (
                       <span className="flex items-center gap-2">
                          <RefreshCw size={18} className="animate-spin" /> Removing Object...
                       </span>
                    ) : (
                       <span className="flex items-center gap-2">
                          <Eraser size={18} /> Remove Object
                       </span>
                    )}
                 </button>
              </div>

           </div>
        </div>
      </div>

      {/* RIGHT: Result Panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden relative">
           
           <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-2xl font-bold text-white">Processed Image</h2>
              {resultImage && (
                 <div className="flex items-center gap-3">
                    <button 
                       onMouseDown={() => setShowOriginal(true)}
                       onMouseUp={() => setShowOriginal(false)}
                       onMouseLeave={() => setShowOriginal(false)}
                       className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800 border border-transparent hover:border-zinc-700"
                    >
                       <ArrowRightLeft size={14} /> Hold to Compare
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                    >
                       <DownloadCloud size={18} />
                    </button>
                 </div>
              )}
           </div>

           <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-zinc-950">
              {/* Dot Grid Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

              {isProcessing ? (
                 <div className="text-center z-10">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                       <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-t-rose-500 rounded-full animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles size={32} className="text-rose-500 animate-pulse" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Erasing...</h3>
                    <p className="text-zinc-500 text-sm">Applying context-aware fill</p>
                 </div>
              ) : !resultImage ? (
                 <div className="text-center z-10 max-w-sm px-6">
                    <div className="w-24 h-24 bg-zinc-900/80 backdrop-blur rounded-full flex items-center justify-center mx-auto border border-zinc-800 mb-6 shadow-xl">
                       <Eraser size={40} className="text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-300 mb-2">Nothing Removed Yet</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                       Upload an image, describe what you want gone, and watch it disappear.
                    </p>
                 </div>
              ) : (
                 <div className="relative w-full h-full p-8 flex items-center justify-center animate-in zoom-in-95 duration-500">
                    <img 
                       src={showOriginal ? originalPreview : resultImage} 
                       alt="Result" 
                       className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50"
                    />
                    {showOriginal && (
                       <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/10 uppercase tracking-wide">
                          Original
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      </div>

    </div>
  );
}

export default RemoveObj;
