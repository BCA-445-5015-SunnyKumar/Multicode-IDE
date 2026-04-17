import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api_base_url } from "../helper";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await fetch(api_base_url + "/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminEmail", email);
        localStorage.setItem("adminPassword", password);
        navigate("/admin");
      } else {
        alert("Wrong credentials");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#111] text-white">
      
      <div className="bg-[#1e1e1e] p-8 rounded-xl shadow-lg w-[350px]">
        
        <h2 className="text-2xl font-semibold text-center mb-6">
          Admin Login
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm text-gray-400">Email</label>
          <input
            type="email"
            placeholder="Enter admin email"
            className="w-full mt-1 p-2 rounded bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm text-gray-400">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            className="w-full mt-1 p-2 rounded bg-[#2a2a2a] outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-2 rounded font-medium"
        >
          Login
        </button>

      </div>
    </div>
  );
};

export default AdminLogin;