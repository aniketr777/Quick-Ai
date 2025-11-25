import { Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useState } from "react";
import { X, Menu } from "lucide-react";
import SideBar from "../components/sideBar";
import { SignIn, useUser } from "@clerk/clerk-react";

function Layout() {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const { user } = useUser();

  return user ? (
    <div className="flex flex-col items-start justify-start h-screen transition-smooth" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <nav 
        className="flex items-center justify-between w-full px-4 py-3 transition-smooth" 
        style={{ 
          borderBottom: `1px solid var(--border-primary)`,
          backgroundColor: 'var(--bg-card)'
        }}
      >
        <img
          src={assets.logo}
          alt="Logo"
          className="w-32 sm:w-44 cursor-pointer"
          onClick={() => navigate("/")}
        />
        
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          {sidebar ? (
            <X
              onClick={() => setSidebar(false)}
              className="w-6 h-6 sm:hidden cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            />
          ) : (
            <Menu
              onClick={() => setSidebar(true)}
              className="w-6 h-6 sm:hidden cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            />
          )}
        </div>
      </nav>

      <div className="flex w-full flex-1 overflow-hidden">
        <SideBar sideBar={sidebar} setSideBar={setSidebar} />
        <div className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <SignIn />
    </div>
  );
}

export default Layout;

