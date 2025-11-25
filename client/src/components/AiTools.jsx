import { AiToolsData } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

function AiTools() {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="px-4 sm:px-20 xl:px-32 my-24">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Powerful AI Tools</h2>
        <p className="text-gray-600">
          Everything you need to create, enhance, and optimise your content with
          cutting-edge AI technology.
        </p>
      </div>

      {/* Tools List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {AiToolsData.map((tool, index) => (
          <div
            key={index}
            className="p-6 sm:p-8 rounded-lg bg-[#FDFDFE] shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => {
              if (user) navigate(tool.path);
            }}
          >
            <tool.Icon
              className="w-12 h-12 p-3 text-white rounded-xl"
              style={{
                background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`,
              }}
            />
            <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-900">{tool.title}</h3>
            <p className="text-gray-600 text-sm">
              {tool.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AiTools;
