import React, { useEffect, useState } from "react";
import { Gem, Sparkles } from "lucide-react";
import { Protect } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

function DashBoard() {
  const [creations, setCreations] = useState([]);
  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);

  const getDashBoardData = async () => {
    try {
      const { data } = await axios.get("api/user/user-creations", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashBoardData();
  }, []);

  return (
    <div className="h-full w-full p-6 flex flex-col fixed">
      {/* Top Stats Cards */}
      <div className="flex justify-start gap-4 flex-wrap mb-6">
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

      {/* Scrollable Creations Section */}
      <div className="flex-1  overflow-auto items-center justify-center w-full">
        {loading ? (
          // Spinner WHILE loading
          <div className="flex justify-center items-center h-full">
            <span className="w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin"></span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="mb-4">Recent Creations</p>
            {creations.length > 0 ? (
              creations.map((item) => (
                <CreationItem key={item.id} item={item} />
              ))
            ) : (
              <p className="text-slate-500">No creations found yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashBoard;
