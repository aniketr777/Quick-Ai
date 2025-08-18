import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import {useClerk,UserButton,useUser} from "@clerk/clerk-react"
import {ArrowRight} from 'lucide-react'
function Navbar() {
  const navigate = useNavigate();
  const {user} = useUser();
  const {openSignIn} = useClerk();






  return (
    <div>
      <div className="fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 cxl:px-32">
        <img
          src={assets.logo}
          className="w-32 sm:w-44"
          onClick={() => navigate("/")}
          alt="Logo"
        />
        {user ? (
          <UserButton />
        ) : (
          <button onClick={openSignIn} className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5">
            Get started
            <ArrowRight className="h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
