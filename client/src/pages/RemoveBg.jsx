import { useState } from "react";
import {
  Eraser,
  RefreshCw,
  Check,
  X,
  UploadCloud,
  Image as ImageIcon,
  Wand2,
  Layers,
  Scissors,
  DownloadCloud,
  ArrowRightLeft
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

function RemoveBg() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [originalPreview, setOriginalPreview] = useState(null);
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

  const handleRemoveBackground = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await axios.post(
        "/api/ai/generate-image-backgorund",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setProcessedImage(String(data.content).trim());
        toast.success("Background removed successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      console.error("Error removing background:", e);
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setProcessedImage(null);
    setShowOriginal(false);
    setOriginalPreview(null);
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'background-removed.png';
    link.click();
  };

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-8rem)] min-h-[700px] flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-8">
      
      {/* LEFT: Upload Panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden relative">
           
           {/* Decorative Top Gradient */}
           <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

           {/* Header */}
           <div className="p-8 border-b border-zinc-800/50 bg-zinc-900">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl text-green-400 border border-green-500/20">
                    <Eraser size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-white">AI Background Remover</h2>
                    <p className="text-xs text-zinc-500 mt-1">Instantly remove backgrounds from any image.</p>
                 </div>
              </div>
           </div>

           {/* Upload Content */}
           <div className="p-8 flex-1 flex flex-col justify-center items-center">
              {!file ? (
                <div 
                  className={`w-full h-full min-h-[300px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                    isDragging 
                      ? 'border-green-500 bg-green-500/5 scale-[0.99]' 
                      : 'border-zinc-700 bg-zinc-950/30 hover:border-zinc-600 hover:bg-zinc-900'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                   <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-xl">
                      <ImageIcon size={32} className="text-green-500" />
                   </div>
                   <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-white">Upload Image</h3>
                      <p className="text-sm text-zinc-500 max-w-xs">Drag and drop JPG or PNG here, or click to browse.</p>
                   </div>
                   <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                      <span className="px-6 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 hover:text-white transition-colors">Choose File</span>
                   </label>
                   <p className="text-xs text-zinc-600 mt-4">Supports JPG, PNG, and WEBP.</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 duration-300">
                   <div className="relative group w-64 aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl">
                      <img src={originalPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={reset}
                        className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-colors"
                      >
                        <X size={14} />
                      </button>
                   </div>
                   
                   <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-1">{file.name}</h3>
                      <p className="text-sm text-zinc-500">Ready to process</p>
                   </div>
                   
                   <button 
                     onClick={handleRemoveBackground}
                     disabled={isProcessing}
                     className="w-full max-w-xs px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/20 border border-transparent text-base font-semibold"
                   >
                     {isProcessing ? (
                        <span className="flex items-center gap-2">
                           <RefreshCw size={18} className="animate-spin" /> Processing...
                        </span>
                     ) : (
                        <span className="flex items-center gap-2">
                           <Scissors size={18} /> Remove Background
                        </span>
                     )}
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* RIGHT: Result Panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden relative">
           
           <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-2xl font-bold text-white">Processed Image</h2>
              {processedImage && (
                 <div className="flex items-center gap-3">
                    <button 
                       onClick={() => setShowOriginal(!showOriginal)}
                       className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                    >
                       <ArrowRightLeft size={14} /> {showOriginal ? "Show Result" : "Compare"}
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                       <DownloadCloud size={18} />
                    </button>
                 </div>
              )}
           </div>

           {/* Canvas Area */}
           <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-zinc-950">
              {/* Checkerboard Pattern for Transparency */}
              <div 
                 className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{
                    backgroundImage: `linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                 }} 
              />

              {isProcessing ? (
                 <div className="text-center z-10">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                       <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Wand2 size={32} className="text-green-500 animate-pulse" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Working Magic...</h3>
                    <p className="text-zinc-500 text-sm">Detecting subjects and refining edges</p>
                 </div>
              ) : !processedImage ? (
                 <div className="text-center z-10 max-w-sm px-6">
                    <div className="w-24 h-24 bg-zinc-900/80 backdrop-blur rounded-full flex items-center justify-center mx-auto border border-zinc-800 mb-6 shadow-xl">
                       <Layers size={40} className="text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-300 mb-2">No Image Processed</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                       Upload an image on the left and click "Remove Background" to see the transparent result here.
                    </p>
                 </div>
              ) : (
                 <div className="relative w-full h-full p-8 flex items-center justify-center animate-in zoom-in-95 duration-500">
                    <img 
                       src={showOriginal ? originalPreview : processedImage} 
                       alt="Result" 
                       className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50"
                    />
                    {showOriginal && (
                       <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                          Original View
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

export default RemoveBg;
