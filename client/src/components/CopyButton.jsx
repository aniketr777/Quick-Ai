import { useState, useEffect } from "react";
import { ClipboardList, Check } from "lucide-react";
import { toast } from "react-hot-toast";

function CopyButton({ textToCopy }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isCopied) {
      timeoutId = setTimeout(() => setIsCopied(false), 1500); // Shorter duration
    }
    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  const handleCopy = async () => {
    if (isCopied) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.success("Text copied!", {
        position: "bottom-right",
        duration: 1500,
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy", {
        position: "bottom-right",
        duration: 1500,
      });
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-1  rounded-md font-medium text-sm text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
      disabled={isCopied}
    >
      {isCopied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <ClipboardList className="w-4 h-4 text-gray-500" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default CopyButton;
