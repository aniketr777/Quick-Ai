import React, { useEffect, useState } from "react";
;
import { Gem, Sparkles } from "lucide-react";
import { Protect } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import { toast } from "react-hot-toast";
import {  useAuth } from "@clerk/clerk-react";
function DashBoard() {
  const [creations, setCreations] = useState([]);
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);

  const getDashBoardData = async () => {
    try{
      const {data} = await axios.get('api/user/getUserCreations',{
        headers:{
          Authorization: `Bearer ${await getToken()}`
        }
      })
      if(data.success){
        setCreations(data.creations)
      }else{
        toast.error(data.message)
      }
    }catch(e){
      toast.error(e?.response?.data?.message || e.message)
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{
    getDashBoardData();
  },[])
  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        {/* Total Creations Card */}
        <div className="flex items-center gap-4 w-72 p-4 bg-white rounded-xl border border-gray-200">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] flex justify-center items-center">
            <Sparkles className="w-5 text-white" />
          </div>
          <div className="text-slate-600">
            <p className="text-sm">Total Creations</p>
            <h2 className="text-xl font-semibold">{creations.length}</h2>
          </div>
        </div>

        {/* Active Plan Card */}
        <div className="flex items-center gap-4 w-72 p-4 bg-white rounded-xl border border-gray-200">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#0BB0D7] flex justify-center items-center">
            <Gem className="w-5 text-white" />
          </div>
          <div className="text-slate-600">
            <p className="text-sm">Active Plan</p>
            <h2 className="text-xl font-semibold">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </h2>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 ">
          <p className="mt-6 mb-4">Recent Creations</p>
          {creations.map((item) => (
            <CreationItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full ">
          <span className="w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin"></span>
        </div>
      )}
      
    </div>
  );
}

export default DashBoard;
