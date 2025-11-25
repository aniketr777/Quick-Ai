import { useState, useEffect } from "react";
import {
   Zap,
   Save,
   Copy,
   Trash2,
   Edit,
   Check,
   X,
   Clock,
   Filter,
   Grid,
   Tag as TagIcon,
   Sparkles,
   Stars,
   RefreshCw,
   Plus,
   Eye
} from "lucide-react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

function PromptVault() {
   const availableTags = [
      "Coding",
      "Image Generation",
      "Image Editing",
      "Image Enhancement",
      "Image Optimization",      
      "Web Development",
      "Debugging",
      "Data Science",
      "Machine Learning",
      "Creative Writing",
      "Copywriting",
      "SEO",
      "Social Media",
      "Marketing",
      "Email Drafting",
      "Business Strategy",
      "Productivity",
      "Summarization",
      "Other"
   ];

   const [isPublic, setIsPublic] = useState(false);
   const [selectedTags, setSelectedTags] = useState([]);
   const [title, setTitle] = useState("");
   const [content, setContent] = useState("");
   const [loading, setLoading] = useState(false);
   const [prompts, setPrompts] = useState([]);
   const [editingPrompt, setEditingPrompt] = useState(null);
   const [isEnhancing, setIsEnhancing] = useState(false);

   const { getToken } = useAuth();
   const { user } = useUser();

   const handleAddTag = (tag) => {
      if (!selectedTags.includes(tag)) {
         setSelectedTags([...selectedTags, tag]);
      }
   };

   const removeTag = (tagToRemove) => {
      setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
   };

   const handleEnhance = async () => {
      if (!content) return;
      setIsEnhancing(true);
      try {
         const token = await getToken();
         const { data } = await axios.post(
            "/api/ai/enhance-prompt",
            { prompt: content,type:"prompt" },
            { headers: { Authorization: `Bearer ${token}` } }
         );

         if (data.success) {
            setContent(data.enhanced);
            toast.success("Prompt enhanced!");
         } else {
            toast.error(data.message || "Failed to enhance prompt");
         }
      } catch (error) {
         console.error("Error enhancing prompt:", error);
         toast.error(error?.response?.data?.message || "Failed to enhance prompt");
      } finally {
         setIsEnhancing(false);
      }
   };

   const handleSave = async (e) => {
      e.preventDefault();
      if (!content || !title || selectedTags.length === 0) {
         toast.error("Please fill title, prompt, and select at least one tag.");
         return;
      }
      setLoading(true);
      try {
         const token = await getToken();
         let url = "/api/ai/create-prompt";
         let method = "post";
         let payload = {
            heading: title,
            prompt: content,
            tags: selectedTags,
            isPublic,
            type: "prompt",
         };

         if (editingPrompt) {
            url = `/api/ai/edit-prompt/${editingPrompt.id}`;
            method = "put";
         }

         const { data } = await axios({
            url,
            method,
            data: payload,
            headers: { Authorization: `Bearer ${token}` },
         });

         if (data.success) {
            toast.success(editingPrompt ? "Prompt updated!" : "Prompt saved!");
            setTitle("");
            setContent("");
            setSelectedTags([]);
            setIsPublic(false);
            setEditingPrompt(null);
            getPrompts();
         } else {
            toast.error(data.message);
         }
      } catch (e) {
         console.error("Error saving prompt:", e);
         toast.error(e?.response?.data?.message || e.message);
      } finally {
         setLoading(false);
      }
   };

   const getPrompts = async () => {
      try {
         const token = await getToken();
         const { data } = await axios.get("/api/user/get-user-prompts", {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (data.success) {
            setPrompts(data.creations || []);
         }
      } catch (e) {
         console.error("Error fetching prompts:", e);
      }
   };

   const handleDelete = async (promptId) => {
      try {
         const token = await getToken();
         const { data } = await axios.delete(`/api/ai/delete-prompt/${promptId}`, {
            headers: { Authorization: `Bearer ${token}` },
         });

         if (data.success) {
            toast.success("Prompt deleted!");
            setPrompts((prev) => prev.filter((p) => p.id !== promptId));
         } else {
            toast.error(data.message);
         }
      } catch (e) {
         console.error("Error deleting prompt:", e);
         toast.error(e?.response?.data?.message || e.message);
      }
   };

   const handleEdit = (prompt) => {
      setEditingPrompt(prompt);
      setTitle(prompt.heading || prompt.title);
      setContent(prompt.prompt);
      setSelectedTags(prompt.tags || []);
      setIsPublic(prompt.is_public || false);
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   useEffect(() => {
      getPrompts();
   }, []);

   return (
      <div className="animate-in fade-in duration-500 h-[calc(100vh-8rem)] min-h-[700px] flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-8">

         {/* LEFT: Save New Prompt Form */}
         <div className="w-full lg:w-1/2 flex flex-col">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl shadow-black/50 overflow-hidden relative">

               {/* Decorative Top Gradient */}
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />

               {/* Header */}
               <div className="p-8 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl text-orange-400 border border-orange-500/20">
                        <Zap size={24} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold text-white">
                           {editingPrompt ? "Edit Prompt" : "Save Prompt"}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Store your best ideas for later.</p>
                     </div>
                  </div>
                  {editingPrompt && (
                     <button
                        onClick={() => {
                           setEditingPrompt(null);
                           setTitle("");
                           setContent("");
                           setSelectedTags([]);
                           setIsPublic(false);
                        }}
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                     >
                        <X size={20} />
                     </button>
                  )}
               </div>

               {/* Form Content */}
               <form onSubmit={handleSave} className="p-8 flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar">

                  {/* Title Input */}
                  <div className="space-y-3">
                     <label className="text-sm font-semibold text-zinc-300 ml-1">Title</label>
                     <input
                        type="text"
                        placeholder="e.g. Cinematic Portrait Generator"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                     />
                  </div>

                  {/* Content Input with AI Enhance Button */}
                  <div className="space-y-3 flex-1 flex flex-col">
                     <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-semibold text-zinc-300">Prompt Content</label>
                        <button
                           type="button"
                           onClick={handleEnhance}
                           disabled={isEnhancing || !content}
                           className="text-xs flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                        >
                           {isEnhancing ? <RefreshCw size={12} className="animate-spin" /> : <Stars size={12} />}
                           {isEnhancing ? 'Improving...' : 'AI Enhance'}
                        </button>
                     </div>
                     <div className="relative flex-1">
                        <textarea
                           className={`w-full h-full min-h-[220px] bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none leading-relaxed ${isEnhancing ? 'opacity-50 blur-[1px]' : ''}`}
                           placeholder="Write your prompt details here..."
                           value={content}
                           onChange={(e) => setContent(e.target.value)}
                           required
                        />
                        {isEnhancing && (
                           <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-zinc-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/30 flex items-center gap-2 text-purple-200 text-sm shadow-xl">
                                 <Sparkles size={16} className="text-purple-400 animate-pulse" />
                                 Adding magic...
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Tags Section */}
                  <div className="space-y-4">
                     <label className="text-sm font-semibold text-zinc-300 ml-1">Tags</label>

                     {/* Selected Tags */}
                     <div className="flex flex-wrap gap-2 min-h-[36px] bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                        {selectedTags.length > 0 ? selectedTags.map(tag => (
                           <span key={tag} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-2 group animate-in zoom-in-95">
                              {tag}
                              <button type="button" onClick={() => removeTag(tag)} className="text-zinc-500 hover:text-white"><X size={12} /></button>
                           </span>
                        )) : (
                           <span className="text-zinc-600 text-sm flex items-center gap-2 px-1">
                              <TagIcon size={14} /> Select tags below...
                           </span>
                        )}
                     </div>

                     {/* Available Tags */}
                     <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                           <button
                              key={tag}
                              type="button"
                              onClick={() => handleAddTag(tag)}
                              className={`px-3 py-1.5 rounded-full text-xs transition-all border ${selectedTags.includes(tag)
                                 ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                 : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                                 }`}
                           >
                              {tag}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Visibility & Actions */}
                  <div className="mt-auto pt-8 border-t border-zinc-800 flex items-center justify-between gap-6">
                     <div className="flex items-center gap-3 bg-zinc-950/50 px-4 py-2 rounded-xl border border-zinc-800">
                        <button
                           type="button"
                           onClick={() => setIsPublic(!isPublic)}
                           className={`w-10 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isPublic ? 'left-5' : 'left-1'}`} />
                        </button>
                        <span className="text-sm font-medium text-zinc-300">{isPublic ? 'Public' : 'Private'}</span>
                     </div>

                     <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/20 border border-transparent text-base font-semibold shadow-xl shadow-orange-500/20 hover:scale-[1.02]"
                     >
                        {loading ? (
                           <><RefreshCw size={18} className="animate-spin" /> {editingPrompt ? "Updating..." : "Saving..."}</>
                        ) : (
                           <><Save size={18} /> {editingPrompt ? "Update Prompt" : "Save to Vault"}</>
                        )}
                     </button>
                  </div>

               </form>
            </div>
         </div>

         {/* RIGHT: Your Prompts List */}
         <div className="w-full lg:w-1/2 flex flex-col h-full overflow-hidden">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-full shadow-2xl overflow-hidden">

               <div className="p-8 border-b border-zinc-800 flex justify-between items-end bg-zinc-900">
                  <div>
                     <h2 className="text-2xl font-bold text-white mb-1">Your Vault</h2>
                     <p className="text-zinc-500 text-xs">{prompts.length} prompts saved</p>
                  </div>

                  {/* <div className="flex gap-2">
                 <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><Filter size={18} /></button>
                 <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><Grid size={18} /></button>
              </div> */}
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-black/20">
                  {prompts.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-6">
                        <div className="relative">
                           <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center border-2 border-dashed border-zinc-800">
                              <Zap size={40} className="opacity-20" />
                           </div>
                           <div className="absolute -bottom-2 -right-2 bg-zinc-800 p-2 rounded-full border border-zinc-700">
                              <Plus size={16} className="text-zinc-400" />
                           </div>
                        </div>
                        <div className="text-center">
                           <p className="text-lg font-medium text-zinc-300">Your vault is empty</p>
                           <p className="text-sm mt-1">Create your first prompt to get started.</p>
                        </div>
                     </div>
                  ) : (
                     prompts.map((item) => (
                        <VaultListItem key={item.id} item={item} onDelete={handleDelete} onEdit={handleEdit} />
                     ))
                  )}
               </div>
            </div>
         </div>

      </div>
   );
}

// Vault List Item Component
const VaultListItem = ({ item, onDelete, onEdit }) => {
   const [copied, setCopied] = useState(false);

   const handleCopy = () => {
      navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   return (
      <div className="group relative bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 animate-in fade-in slide-in-from-bottom-2">
         {/* Glass gradient overlay on hover */}
         <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

         <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 mb-4">
               <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-lg group-hover:text-orange-100 transition-colors truncate">
                     {item.heading || item.title}
                  </h4>
                  <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-1">
                     <Clock size={12} /> {new Date(item.created_at).toLocaleDateString()}
                  </span>
               </div>
               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                     onClick={() => onEdit(item)}
                     className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                     title="Edit"
                  >
                     <Edit size={16} />
                  </button>
                  <button
                     onClick={() => onDelete(item.id)}
                     className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                     title="Delete"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>
            </div>

            <div className="relative group/text">
               <p className="text-sm text-zinc-400 leading-relaxed mb-5 line-clamp-3 font-mono bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 group-hover/text:border-zinc-700 transition-colors break-words overflow-wrap-anywhere">
                  {item.prompt}
               </p>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex flex-wrap gap-2">
                  {item.tags && item.tags.slice(0, 3).map((tag, i) => (
                     <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 group-hover:border-zinc-600 transition-colors">{tag}</span>
                  ))}
               </div>

               <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copied
                     ? 'bg-emerald-500/10 text-emerald-400'
                     : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                     }`}
               >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
               </button>
            </div>
         </div>
      </div>
   );
};

export default PromptVault;
