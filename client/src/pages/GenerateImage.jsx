import { useState, useEffect } from "react";
import {
   Image as ImageIcon,
   Sparkles,
   AlertTriangle,
   Wand2,
   Sliders,
   ChevronRight,
   Eye,
   RefreshCw,
   Download,
   Maximize2,
   Plus,
   Square,
   RectangleHorizontal,
   RectangleVertical,
   MinusCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth, useUser } from "@clerk/clerk-react";
import ShareButton from "../components/ShareButton";

// --- MAIN PAGE COMPONENT ---

function GenerateImage() {
   const STYLES = [
      { id: "Original", label: "Original", color: "from-zinc-500 to-zinc-700" },
      { id: "Realistic", label: "Realistic", color: "from-emerald-500 to-teal-600" },
      { id: "Anime", label: "Anime", color: "from-pink-500 to-rose-500" },
      { id: "Cyberpunk", label: "Cyberpunk", color: "from-cyan-500 to-blue-600" },
      { id: "3D Render", label: "3D", color: "from-violet-500 to-purple-600" },
      { id: "Ghibli", label: "Ghibli", color: "from-green-400 to-emerald-500" },
   ];

   const [loading, setLoading] = useState(false);
   const [isEnhancing, setIsEnhancing] = useState(false);

   const [content, setContent] = useState(null);
   const [warning, setWarning] = useState("");
   const { getToken } = useAuth();
   const { user } = useUser();

   const [prompt, setPrompt] = useState("");
   const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
   const [isPublic, setIsPublic] = useState(true);
   const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
   const [aspectRatio, setAspectRatio] = useState("square");
   const [negativePrompt, setNegativePrompt] = useState("");

   const [history, setHistory] = useState([]);

   // Fetch User History
   useEffect(() => {
      if (user) {
         fetchHistory();
      }
   }, [user]);

   const fetchHistory = async () => {
      try {
         const token = await getToken();
         const { data } = await axios.get("/api/user/creations", {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (data.success) {
            // Filter only image types if needed, or backend handles it
            const images = data.creations.filter(c => c.type === 'image');
            setHistory(images);
            if (images.length > 0 && !content) {
               setContent(images[0].content);
            }
         }
      } catch (e) {
         console.error("Failed to fetch history", e);
      }
   };

   const onSubmitHandler = async (e) => {
      e.preventDefault();
      setWarning("");
      setLoading(true);

      try {
         const token = await getToken();
         const { data } = await axios.post(
            "/api/ai/generate-image",
            {
               prompt: `${prompt} ${selectedStyle !== "Original" ? `, ${selectedStyle} style` : ""}`,
               publish: isPublic
            },
            {
               headers: { Authorization: `Bearer ${token}` },
            }
         );

         if (data.success) {
            setContent(data.secure_url);
            toast.success("Image generated successfully!");
            fetchHistory(); // Refresh history
         } else {
            toast.error(data.message || "Failed to generate image");
            if (data.message && data.message.includes("Upgrade")) {
               setWarning("You've reached the free limit. Upgrade to Premium for more.");
            }
         }

      } catch (e) {
         console.error(e);
         toast.error(e.response?.data?.message || "Something went wrong");
      } finally {
         setLoading(false);
      }
   };

   const handleEnhance = async () => {
      if (!prompt) {
         toast.error("Please enter a prompt to enhance");
         return;
      }
      setIsEnhancing(true);
      try {
         const token = await getToken();
         const { data } = await axios.post(
            "/api/ai/enhance-prompt",
            { prompt, type: "image" },
            { headers: { Authorization: `Bearer ${token}` } }
         );
         if (data.success) {
            setPrompt(data.enhanced);
            toast.success("Prompt enhanced!");
         } else {
            toast.error("Failed to enhance prompt");
         }
      } catch (e) {
         console.error(e);
         toast.error("Failed to enhance prompt");
      } finally {
         setIsEnhancing(false);
      }
   };

   return (
      <div className="animate-in fade-in duration-500 h-[calc(100vh-8rem)] min-h-[600px] flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 bg-black">

         {/* LEFT: Control Panel */}
         <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                  <Wand2 size={24} />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-white">AI Image Generator</h2>
                  <p className="text-xs text-zinc-500">Transform your words into art</p>
               </div>
            </div>

            <form onSubmit={onSubmitHandler} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 flex-1 shadow-lg">

               {/* Prompt Input */}
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        Image Prompt <span className="text-zinc-500 text-xs font-normal">(Required)</span>
                     </label>

                     <button
                        type="button"
                        onClick={handleEnhance}
                        disabled={isEnhancing || !prompt}
                        className={`text-xs flex items-center gap-1 transition-colors ${isEnhancing || !prompt
                           ? "text-zinc-600 cursor-not-allowed"
                           : "text-orange-400 hover:text-orange-300"
                           }`}
                     >
                        {isEnhancing ? (
                           <>
                              <RefreshCw size={12} className="animate-spin" /> Enhancing...
                           </>
                        ) : (
                           <>
                              <Sparkles size={12} /> Enhance with ai
                           </>
                        )}
                     </button>
                  </div>
                  <textarea
                     className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none"
                     placeholder="Describe your imagination... e.g. A cozy cabin in a snowy forest with glowing windows, 8k resolution"
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     required
                  />
               </div>

               {/* Style Selector */}
               <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Image Style</label>
                  <div className="grid grid-cols-3 gap-2">
                     {STYLES.map((style) => (
                        <button
                           key={style.id}
                           type="button"
                           onClick={() => setSelectedStyle(style.id)}
                           className={`relative px-2 py-2 rounded-lg text-xs font-medium transition-all text-center overflow-hidden group border ${selectedStyle === style.id
                              ? 'text-white border-white/20 bg-white/5'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                              }`}
                        >
                           {selectedStyle === style.id && (
                              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${style.color}`} />
                           )}
                           <span className="relative z-10 truncate">{style.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               {/* Advanced Settings (Collapsible) */}
               <div className="border-t border-zinc-800 pt-4">
                  <button
                     type="button"
                     onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                     className="w-full flex items-center justify-between text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-4"
                  >
                     <span className="flex items-center gap-2"><Sliders size={16} /> Advanced Settings</span>
                     <ChevronRight size={16} className={`transition-transform duration-200 ${isAdvancedOpen ? 'rotate-90' : ''}`} />
                  </button>

                  {isAdvancedOpen && (
                     <div className="space-y-5 animate-in slide-in-from-top-2 duration-200">

                        <div className="space-y-2">
                           <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Aspect Ratio</label>
                           <div className="flex gap-2">
                              {[
                                 { id: 'square', icon: Square, label: '1:1' },
                                 { id: 'landscape', icon: RectangleHorizontal, label: '16:9' },
                                 { id: 'portrait', icon: RectangleVertical, label: '9:16' },
                              ].map((ratio) => (
                                 <button
                                    key={ratio.id}
                                    type="button"
                                    onClick={() => setAspectRatio(ratio.id)}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg border transition-all ${aspectRatio === ratio.id
                                       ? 'bg-zinc-800 border-zinc-600 text-white'
                                       : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                       }`}
                                 >
                                    <ratio.icon size={18} />
                                    <span className="text-[10px]">{ratio.label}</span>
                                 </button>
                              ))}
                           </div>
                        </div>


                        <div className="space-y-2">
                           <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                              <MinusCircle size={12} /> Negative Prompt
                           </label>
                           <input
                              type="text"
                              placeholder="blur, distorted, low quality..."
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                              value={negativePrompt}
                              onChange={(e) => setNegativePrompt(e.target.value)}
                           />
                        </div>
                     </div>
                  )}
               </div>

               {/* Toggle Visibility & Generate */}
               <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                        <Eye size={16} className="text-zinc-400" />
                        <span className="text-sm text-zinc-300">Public Visibility</span>
                     </div>
                     <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-orange-500' : 'bg-zinc-700'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isPublic ? 'left-6' : 'left-1'}`} />
                     </button>
                  </div>

                  <button
                     type="submit"
                     disabled={loading || !prompt}
                     className="w-full py-3 text-base shadow-xl shadow-orange-500/10 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/20"
                  >
                     {loading ? (
                        <span className="flex items-center gap-2">
                           <RefreshCw size={18} className="animate-spin" /> Generating...
                        </span>
                     ) : (
                        <span className="flex items-center gap-2">
                           <ImageIcon size={18} /> Generate Image
                        </span>
                     )}
                  </button>
               </div>
            </form>
         </div>

         {/* RIGHT: Preview Canvas */}
         <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Main Canvas */}
            <div className="flex-1 bg-black border border-zinc-800 rounded-2xl relative overflow-hidden flex items-center justify-center p-2 group">

               {/* Grid Pattern Background */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

               {/* Warning Message */}
               {warning && (
                  <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium px-4 py-3 rounded-xl backdrop-blur-md">
                     <AlertTriangle size={16} />
                     {warning}
                  </div>
               )}

               {content ? (
                  <div className="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center animate-in zoom-in-95 duration-500 p-4">
                     <img
                        src={content}
                        alt="Generated"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black"
                     />

                     {/* Floating Action Bar */}
                     <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-zinc-900/90 backdrop-blur-md rounded-xl border border-zinc-700/50 shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <button className="text-xs h-8 px-3 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center gap-1">
                           <Maximize2 size={14} /> Fullscreen
                        </button>
                        <div className="w-px h-4 bg-zinc-700"></div>
                        <button className="text-xs h-8 px-3 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center gap-1">
                           <Download size={14} /> Download
                        </button>
                        {/* UPDATED SHARE BUTTON: Manually triggers our Popup */}
                        <ShareButton
                           url={content}
                           className="text-xs h-8 px-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg transition-colors flex items-center gap-1"
                           iconSize={14}
                        />
                     </div>
                  </div>
               ) : loading ? (
                  <div className="text-center space-y-4 z-10">
                     <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Sparkles size={32} className="text-orange-500 animate-pulse" />
                        </div>
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white mb-1 animate-pulse">Creating Magic...</h3>
                        <p className="text-zinc-500 text-sm">This usually takes about 10 seconds</p>
                     </div>
                  </div>
               ) : (
                  <div className="text-center space-y-6 z-10 max-w-md px-6">
                     <div className="w-32 h-32 bg-zinc-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-zinc-800 text-zinc-700 mb-4 group-hover:border-zinc-600 group-hover:text-zinc-500 transition-colors">
                        <ImageIcon size={64} strokeWidth={1} />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-zinc-200">Creative Canvas</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                           Your masterpiece will appear here. Enter a prompt to start generating, or select a style to get inspired.
                        </p>
                     </div>
                     <div className="flex justify-center gap-3">
                        <button
                           type="button"
                           onClick={() => setPrompt("Cyberpunk City")}
                           className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                        >
                           Try "Cyberpunk City"
                        </button>
                        <button
                           type="button"
                           onClick={() => setPrompt("Watercolor Cat")}
                           className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                        >
                           Try "Watercolor Cat"
                        </button>
                     </div>
                  </div>
               )}
            </div>

            {/* History Strip */}
            <div className="h-24 flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex gap-3 overflow-x-auto custom-scrollbar">
               <div className="flex-shrink-0 w-24 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 cursor-pointer transition-colors">
                  <Plus size={20} />
                  <span className="text-[10px] mt-1">New</span>
               </div>
               {history.map((img, i) => (
                  <div
                     key={i}
                     onClick={() => setContent(img.content)}
                     className="relative w-24 h-full rounded-lg overflow-hidden border border-zinc-800 hover:border-orange-500 cursor-pointer transition-colors group"
                  >
                     <img src={img.content} alt="" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={16} className="text-white" />
                     </div>
                  </div>
               ))}
            </div>
         </div>

      </div>
   );
}

export default GenerateImage;
