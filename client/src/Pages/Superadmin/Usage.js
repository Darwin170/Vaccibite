import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./usage.css";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0", "#F44336"];

function Usage() {
  const [positionData, setPositionData] = useState([]);

  const fetchLogs = async () => {
    try {
      const { data: logs } = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getLogs`);

      
      const counts = {};
      logs.forEach((log) => {
        const position = log.user?.position || "Unknown";
        counts[position] = (counts[position] || 0) + 1;
      });

      const chartData = Object.keys(counts).map((key) => ({
        position: key,
        count: counts[key],
      }));

      setPositionData(chartData);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="usage-container flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Usage by Position</h1>

        <div className="usage-chart-grid">
        
          <div className="usage-chart-card">
            <h2 className="usage-chart-title">Usage by Position (Line Graph)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={positionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="position" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4CAF50"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#2196F3" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

       
          <div className="usage-chart-card">
            <h2 className="usage-chart-title">Usage by Position (Pie Chart)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={positionData}
                  dataKey="count"
                  nameKey="position"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {positionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usage;

