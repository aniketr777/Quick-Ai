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
    <div className="flex flex-col items-start justify-start  h-screen">
      <nav className="flex items-center justify-between w-full px-4 py-2 border-b border-gray-200">
        <img
          src={assets.logo}
          alt="Logo"
          className=" w-32 sm:w-44 cursor-pointer"
          onClick={() => navigate("/")}

        />
        {sidebar ? (
          <X
            onClick={() => setSidebar(false)}
            className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer"
          />
        ) : (
          <Menu
            onClick={() => setSidebar(true)}
            className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer"
          />
        )}
      </nav>

      <div className="flex w-full  ">
        <SideBar sideBar={sidebar} setSideBar={setSidebar} />
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <SignIn />
    </div>
  );
}

export default Layout;
