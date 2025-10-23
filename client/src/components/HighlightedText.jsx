import React from "react";
import ReactMarkdown from "react-markdown";

const HighlightedText = ({ content="" }) => {
  const formatted = content.replace(/"""\s*([\s\S]*?)\s*"""/g, (_, code) => {
    return `\n\`\`\`\n${code}\n\`\`\`\n`;
  });

  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{formatted}</ReactMarkdown>
    </div>
  );
};

export default HighlightedText;
