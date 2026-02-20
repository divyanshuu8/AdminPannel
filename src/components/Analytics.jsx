import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaEye,
  FaMousePointer,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaUserAlt,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- STAT CARD COMPONENT ---
const StatCard = ({ title, value, icon, change, changeType }) => {
  const IconComponent = icon;
  const isPositive = changeType === "positive";

  return (
    <div className="card shadow-sm p-4 rounded-3 h-100 border-0">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <p className="text-muted small mb-1">{title}</p>
          <p className="h3 fw-bold text-dark mb-0">{value}</p>
        </div>
        <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
          <IconComponent className="fs-3" />
        </div>
      </div>
      {change && (
        <div
          className={`d-flex align-items-center mt-2 small ${
            isPositive ? "text-success" : "text-danger"
          }`}
        >
          {isPositive ? (
            <FaArrowUp className="me-1" />
          ) : (
            <FaArrowDown className="me-1" />
          )}
          {change}
          <span className="text-muted ms-1">vs. last period</span>
        </div>
      )}
    </div>
  );
};

// --- MAIN DASHBOARD ---
const Analytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://cw-serverless-interiorjimail.onrender.com/api/analytics");
        const json = await res.json();
        if (json.success) {
          setAnalytics(json.data);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- DATA PROCESSING ---
  const groupedByDate = analytics.reduce((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = { Users: 0, Views: 0 };
    }
    acc[curr.date].Users += Number(curr.activeUsers);
    acc[curr.date].Views += Number(curr.pageViews);
    return acc;
  }, {});

  const trafficData = Object.keys(groupedByDate)
    .sort()
    .map((date) => ({
      name: date.slice(-2), // show day only
      Users: groupedByDate[date].Users,
      Views: groupedByDate[date].Views,
    }));

  const sourceData = analytics.reduce((acc, curr) => {
    acc[curr.device] = (acc[curr.device] || 0) + Number(curr.sessions);
    return acc;
  }, {});

  const pieData = Object.keys(sourceData).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: sourceData[key],
    color:
      key === "mobile"
        ? "#4285F4"
        : key === "desktop"
        ? "#34A853"
        : key === "tablet"
        ? "#FBBC05"
        : "#999",
  }));

  const pageViewsByPath = analytics.reduce((acc, curr) => {
    acc[curr.page] = (acc[curr.page] || 0) + Number(curr.pageViews);
    return acc;
  }, {});
  const topPages = Object.entries(pageViewsByPath)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const totalUsers = analytics.reduce(
    (sum, d) => sum + Number(d.activeUsers),
    0
  );
  const totalViews = analytics.reduce((sum, d) => sum + Number(d.pageViews), 0);
  const avgBounceRate =
    analytics.reduce((sum, d) => sum + parseFloat(d.bounceRate), 0) /
    analytics.length;
  const avgSession =
    analytics.reduce((sum, d) => sum + parseFloat(d.avgSessionDuration), 0) /
    analytics.length;

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <h3>Loading Analytics...</h3>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light p-4 p-md-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="h1 fw-bold text-dark mb-0">
          Interiorji Analytics Dashboard
        </h1>
        <button className="btn btn-outline-primary d-flex align-items-center">
          <FaCalendarAlt className="me-2" />
          <span>Last 7 Days</span>
        </button>
      </div>

      {/* STATS */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Total Users" value={totalUsers} icon={FaUsers} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard title="Page Views" value={totalViews} icon={FaEye} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Bounce Rate"
            value={`${(avgBounceRate * 100).toFixed(1)}%`}
            icon={FaMousePointer}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Avg. Session"
            value={`${avgSession.toFixed(1)}s`}
            icon={FaClock}
          />
        </div>
      </div>

      {/* CHARTS & TABLE */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm p-4 rounded-3 h-100 border-0">
            <h3 className="h5 fw-semibold text-dark mb-4">Traffic Over Time</h3>
            <div style={{ width: "100%", height: "300px" }}>
              <ResponsiveContainer>
                <LineChart
                  data={trafficData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Users"
                    stroke="#0d6efd"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Views"
                    stroke="#198754"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          {/* PIE CHART */}
          <div className="card shadow-sm p-4 rounded-3 border-0 mb-4">
            <h3 className="h5 fw-semibold text-dark mb-4">Traffic by Device</h3>
            <div style={{ width: "100%", height: "250px" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3">
              {pieData.map((entry) => (
                <div
                  key={entry.name}
                  className="d-flex align-items-center justify-content-between mb-2"
                >
                  <div className="d-flex align-items-center">
                    <FaUserAlt
                      className="me-2"
                      style={{ color: entry.color }}
                    />
                    <span className="text-dark">{entry.name}</span>
                  </div>
                  <span className="fw-bold text-dark">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP PAGES */}
          <div className="card shadow-sm p-4 rounded-3 border-0">
            <h3 className="h5 fw-semibold text-dark mb-4">Top Pages</h3>
            <div
              className="table-responsive"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <table className="table text-start table-hover align-middle mb-0">
                <thead
                  className="table-light"
                  style={{ position: "sticky", top: 0 }}
                >
                  <tr>
                    <th className="p-3">Page Path</th>
                    <th className="p-3">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((p) => (
                    <tr key={p.path}>
                      <td className="p-3 fw-medium text-primary">{p.path}</td>
                      <td className="p-3">{p.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
