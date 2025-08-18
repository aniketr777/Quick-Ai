import { Protect, useClerk, useUser } from "@clerk/clerk-react";
import {
  LogOut,
  Eraser,
  House,
  Scissors,
  SquarePen,
  Hash,
  Image,
  FileText,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Users },
];

function SideBar({ sideBar, setSideBar }) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <div
      className={`w-60 bg-white border-r border-gray-200  flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        max-sm:fixed max-sm:top-14 max-sm:bottom-0 max-sm:left-0 max-sm:z-50
        ${sideBar ? "translate-x-0" : "max-sm:-translate-x-full"}`}
    >
      {/* Top: User + Nav */}
      <div className="my-7 w-full">
        {user && (
          <>
            <img
              src={user.imageUrl}
              alt="User"
              className="w-14 h-14 rounded-full mx-auto object-cover"
            />
            <h1 className="mt-1 text-center font-medium">{user.fullName}</h1>

            <div className="px-6 mt-5 text-sm text-gray-600 font-medium">
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/ai"}
                  onClick={() => setSideBar(false)}
                  className={({ isActive }) =>
                    `px-3.5 py-2.5 flex items-center gap-3 rounded transition
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white"
                        : "hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom: Profile + Logout */}
      {user && (
        <div className="w-full border-t border-gray-200 p-4 px-7">
          <div
            className="flex gap-3 items-center cursor-pointer group"
            onClick={openUserProfile}
          >
            <img
              src={user.imageUrl}
              className="w-8 h-8 rounded-full object-cover"
              alt="User avatar"
            />
            <div className="flex-1">
              <h1 className="text-sm font-medium">{user.fullName}</h1>
              <p className="text-xs text-gray-500">
                <Protect plan="premium" fallback="Free">
                  Premium
                </Protect>{" "}
                Plan
              </p>
            </div>
            <LogOut
              onClick={(e) => {
                e.stopPropagation(); // prevent opening profile
                signOut();
              }}
              className="w-5 text-gray-400 hover:text-red-500 transition cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SideBar;
