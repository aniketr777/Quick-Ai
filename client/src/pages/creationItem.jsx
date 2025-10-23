import { Image, FileText, Type, MoreVertical } from "lucide-react";
import React from "react";

// --- UI/UX: Centralized icon mapping for consistency and easy updates. ---
const typeInfo = {
  image: { icon: <Image />, label: "Image" },
  prompt: { icon: <FileText />, label: "Prompt" },
  blogTitle: { icon: <Type />, label: "Blog Title" },
  article: { icon: <FileText />, label: "Article" },
  default: { icon: <FileText />, label: "Text" },
};

// --- A helper to get the icon and label for a given type ---
const getCreationType = (type) => {
  const info = typeInfo[type] || typeInfo.default;
  // --- UI/UX: Clone the element to apply consistent styling across all icons ---
  return {
    icon: React.cloneElement(info.icon, {
      className: "w-4 h-4 text-slate-500",
    }),
    label: info.label,
  };
};

function CreationItem({ item, onClick }) {
  const { icon, label } = getCreationType(item.type);
  const title = item.title || item.prompt || "Untitled Creation";

  return (
    <button
      onClick={onClick}
      className="group relative w-full bg-white border border-slate-200 rounded-xl text-leftshadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 focus:outline-none focus-visible:ring-2  focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex flex-col overflow-hidden break-inside-avoid"
    >
      <div
        className="absolute top-3 right-3 z-10 p-1.5 bg-white/70 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <MoreVertical className="w-5 h-5 text-slate-600" />
      </div>


      <div className="w-full flex-grow">
        {item.type === "image" ? (
         
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={item.content}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          
          <div className="p-5">
            <p className="text-slate-600 text-sm line-clamp-5">
              {item.content}
            </p>
          </div>
        )}
      </div>

      {/* --- 2. FOOTER: Always visible, providing essential context at a glance --- */}
      <div className="w-full p-4 border-t border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800 truncate mb-1.5">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs text-slate-500 font-medium">{label}</span>
        </div>
      </div>
    </button>
  );
}

export default CreationItem;
