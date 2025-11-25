import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Zap,
  ArrowUpRight,
  Settings,
  Plus,
  ChevronRight,
  Clock,
  Download,
  Image as ImageIcon,
  FileText,
  Scissors
} from "lucide-react";
import { Protect, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import { usePlans } from '@clerk/clerk-react/experimental'


function DashBoard() {
  const [stats, setStats] = useState({
    totalCreations: 0,
    creditsRemaining: 0,
    activePlan: "Free"
  });
  const [recentCreations, setRecentCreations] = useState([]);
  const [loading, setLoading] = useState(true);


  const { data, isLoading, hasNextPage, fetchNext, hasPreviousPage, fetchPrevious } = usePlans({
    for: 'user',
    pageSize: 10,
  })





  axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
  const { getToken } = useAuth();
  const { user } = useUser();

  const getDashBoardData = async () => {
    try {
      const { data } = await axios.get("api/user/user-creations", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        // Calculate total creations (all types)
        const totalCreations = data.creations.length;

        // Get credits from Clerk metadata
        const freeUsage = user?.privateMetadata?.free_usage || 0;
        const userPlan = user?.privateMetadata?.plan || "Free";

        // Calculate remaining credits
        let creditsRemaining;
        if (userPlan === "Premium" || userPlan === "premium") {
          creditsRemaining = "Unlimited";
        } else {
          // Free users get 10 credits total
          creditsRemaining = Math.max(0, 10 - freeUsage);
        }

        // Set stats
        setStats({
          totalCreations,
          creditsRemaining,
          activePlan: userPlan
        });

        // Set recent creations (last 5)
        setRecentCreations(data.creations);
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

  const StatCard = ({ label, value, subtext, icon: Icon, colorClass }) => (
    <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-6 group hover:border-zinc-700 transition-all duration-300">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon size={64} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 ${colorClass} bg-opacity-10 text-opacity-100`}>
            <Icon size={20} />
          </div>
          <h3 className="text-sm font-medium text-zinc-400">{label}</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{value}</span>
          {subtext && <span className="text-xs font-medium text-emerald-500">{subtext}</span>}
        </div>
      </div>
    </div>
  );
  const StatCard1 = ({ label, subtext, icon: Icon, colorClass }) => (
    <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-6 group hover:border-zinc-700 transition-all duration-300">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon size={64} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 ${colorClass} bg-opacity-10 text-opacity-100`}>
            <Icon size={20} />
          </div>
          <h3 className="text-sm font-medium text-zinc-400">{label}</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white"><Protect plan="premium" fallback="Free">Premium</Protect></span>
          {subtext && <span className="text-xs font-medium text-emerald-500">{subtext}</span>}
        </div>
      </div>
    </div>
  );
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'saved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'reviewed': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return <ImageIcon size={14} className="text-purple-400" />;
      case 'prompt': return <Zap size={14} className="text-amber-400" />;
      case 'text': return <FileText size={14} className="text-blue-400" />;
      case 'edit': return <Scissors size={14} className="text-zinc-400" />;
      default: return <Sparkles size={14} className="text-zinc-400" />;
    }
  };

  const CreationRow = ({ item }) => (
    <div className="group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:shadow-lg transition-all">
          {item.content ? (
            <img src={item.content} alt="" className="w-full h-full object-cover" />
          ) : (
            getTypeIcon(item.type)
          )}
        </div>
        <div>
          <h4 className="font-semibold text-zinc-200 text-sm group-hover:text-white transition-colors">
            {item.heading || item.title || "Untitled"}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
              {getTypeIcon(item.type)}
              <span className="capitalize">{item.type}</span>
            </div>
            <span className="text-xs text-zinc-600 flex items-center gap-1">
              <Clock size={10} /> {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`hidden sm:inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor('completed')} capitalize`}>
          completed
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.content && (
            <button className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              <Download size={16} />
            </button>
          )}
          <button className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8">
      {/* <Protect plan="premium" fallback="Free">Premium</Protect> */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>

           
          
          <p className="text-zinc-400">Welcome back, {user?.firstName || "User"}. Here's what's happening today.</p>
        </div>
        {/* <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 bg-transparent border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-sm h-10">
            <Settings size={16} /> Manage
          </button>
          
          <button className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/20 border border-transparent text-sm h-10 shadow-lg shadow-orange-500/20">
            <Plus size={18} /> New Creation
          </button>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Total Creations"
          value={stats.totalCreations}
          subtext=""
          icon={Sparkles}
          colorClass="text-blue-500"
        />
        {/* <StatCard
          label="Credits Remaining"
          value={stats.creditsRemaining}
          subtext=""
          icon={Zap}
          colorClass="text-amber-500"
        /> */}
        <StatCard1
          label="Active Plan"
          // value={stats.activePlan}
          subtext=""
          icon={ArrowUpRight}
          colorClass="text-emerald-500"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Creations</h3>
          {/* <button className="text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </button> */}
        </div>

        <div className="space-y-3">
          {recentCreations.length > 0 ? (
            recentCreations.map(item => (
              <CreationRow key={item.id} item={item} />
            ))
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
              <p>No creations yet. Start creating something amazing!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default DashBoard;
