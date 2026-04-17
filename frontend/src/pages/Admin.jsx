import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api_base_url } from "../helper";
import { Bar } from "react-chartjs-2";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Admin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  const navigate = useNavigate();

  // ✅ Check admin access
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");

    if (!isAdmin) {
      navigate("/admin-login");
    } else {
      fetchAll();
    }
  }, []);

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminPassword");
    navigate("/");
  };

  // 🎨 Colors
  const generateColors = (count) => {
    const colors = [
      "#4CAF50",
      "#2196F3",
      "#FF9800",
      "#E91E63",
      "#9C27B0",
      "#00BCD4",
      "#FFC107",
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  // ✅ Fetch Data (FIXED)
  const fetchAll = async () => {
    try {
      const [u, p, a] = await Promise.all([
        fetch(api_base_url + "/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAdmin: true }), // ✅ FIX
        }),
        fetch(api_base_url + "/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAdmin: true }), // ✅ FIX
        }),
        fetch(api_base_url + "/admin/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAdmin: true }), // ✅ FIX
        }),
      ]);

      const userData = await u.json();
      const projectData = await p.json();
      const analyticsData = await a.json();

      const usersList = userData.users || [];
      const projectsList = projectData.projects || [];

      setStats({
        totalUsers: usersList.length,
        totalProjects: projectsList.length,
      });

      setUsers(usersList);
      setProjects(projectsList);
      setAnalytics(analyticsData.data || []);

    } catch (err) {
      console.error(err);
      toast.error("Error loading admin data");
    }
  };

  // ✅ Delete user (FIXED)
  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;

    try {
      await fetch(api_base_url + "/admin/deleteUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          isAdmin: true, // ✅ FIX
        }),
      });

      toast.success("User deleted");
      fetchAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  // 📊 Chart
  const chartData = {
    labels: analytics.map((a) => a._id),
    datasets: [
      {
        label: "Projects by Language",
        data: analytics.map((a) => a.count),
        backgroundColor: generateColors(analytics.length),
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: { color: "#ffffff" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "#333" },
      },
      y: {
        ticks: { color: "#ffffff" },
        grid: { color: "#333" },
      },
    },
  };

  return (
    <>
      <Navbar />

      <div className="p-6 md:px-[100px] bg-[#111] text-white min-h-screen">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 px-4 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1e1e1e] p-5 rounded">
            <h2>Users</h2>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>

          <div className="bg-[#1e1e1e] p-5 rounded">
            <h2>Projects</h2>
            <p className="text-2xl font-bold">{stats.totalProjects}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#1e1e1e] p-5 rounded mb-8">
          <h2>Analytics</h2>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Users */}
        <h2 className="text-xl mb-3">All Users</h2>
        <div className="space-y-3 mb-8">
          {users.map((u) => (
            <div key={u._id} className="bg-[#1e1e1e] p-3 rounded flex justify-between">
              <div>
                <p>{u.fullName}</p>
                <p className="text-sm text-gray-400">{u.email}</p>
              </div>
              <button
                onClick={() => deleteUser(u._id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Projects */}
        <h2 className="text-xl mb-3">All Projects</h2>
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p._id} className="bg-[#1e1e1e] p-3 rounded">
              <p>{p.name}</p>
              <p className="text-sm text-gray-400">{p.projectLanguage}</p>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default Admin;