import React from "react";
import {
  FaUsers,
  FaEye,
  FaMousePointer,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaGoogle,
  FaFacebook,
  FaLink,
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

// --- MOCK DATA ---

// 1. Data for the Traffic Over Time line chart
const trafficData = [
  { name: "Jan", Users: 8400, Views: 19400 },
  { name: "Feb", Users: 9800, Views: 22100 },
  { name: "Mar", Users: 10100, Views: 22900 },
  { name: "Apr", Users: 11700, Views: 25000 },
  { name: "May", Users: 10500, Views: 23000 },
  { name: "Jun", Users: 12450, Views: 27890 },
];

// 2. Data for the Traffic Sources pie chart
const sourceData = [
  { name: "Google", value: 18900, icon: FaGoogle, color: "#4285F4" },
  { name: "Direct", value: 9200, icon: FaUserAlt, color: "#34A853" },
  { name: "Social", value: 4500, icon: FaFacebook, color: "#1877F2" },
  { name: "Referral", value: 3100, icon: FaLink, color: "#FBBC05" },
];

// 3. Data for the Top Pages table
const topPages = [
  { path: "/", views: 18200, percentage: "39.6%" },
  { path: "/gallery/modern-living", views: 9150, percentage: "19.9%" },
  { path: "/contact", views: 5400, percentage: "11.8%" },
  { path: "/blog/scandinavian-design-tips", views: 3110, percentage: "6.8%" },
  { path: "/services/e-design", views: 2045, percentage: "4.5%" },
];

// --- COMPONENTS ---

// 1. STAT CARD COMPONENT (Same as before)
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
          <span className="text-muted ms-1">vs. last month</span>
        </div>
      )}
    </div>
  );
};

// 2. TRAFFIC OVER TIME (LINE CHART)
const TrafficOverTimeChart = () => (
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
          <Tooltip wrapperClassName="card shadow-lg p-2 rounded" />
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
);

// 3. TRAFFIC SOURCES (PIE CHART)
const TrafficSourceChart = () => {
  // Custom label for Pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // Don't render small labels

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="fw-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="card shadow-sm p-4 rounded-3 border-0 mb-4">
      <h3 className="h5 fw-semibold text-dark mb-4">Traffic Sources</h3>
      <div style={{ width: "100%", height: "250px" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={sourceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
            >
              {sourceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3">
        {sourceData.map((entry) => (
          <div
            key={entry.name}
            className="d-flex align-items-center justify-content-between mb-2"
          >
            <div className="d-flex align-items-center">
              <entry.icon className="me-2" style={{ color: entry.color }} />
              <span className="text-dark">{entry.name}</span>
            </div>
            <span className="fw-bold text-dark">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. TOP PAGES TABLE
const TopPagesTable = () => (
  <div className="card shadow-sm p-4 rounded-3 border-0">
    <h3 className="h5 fw-semibold text-dark mb-4">Top Pages</h3>
    <div
      className="table-responsive"
      style={{ maxHeight: "300px", overflowY: "auto" }}
    >
      <table className="table text-start table-hover align-middle mb-0">
        <thead className="table-light" style={{ position: "sticky", top: 0 }}>
          <tr>
            <th scope="col" className="p-3">
              Page Path
            </th>
            <th scope="col" className="p-3">
              Views
            </th>
          </tr>
        </thead>
        <tbody>
          {topPages.map((page) => (
            <tr key={page.path}>
              <td className="p-3 fw-medium text-primary">{page.path}</td>
              <td className="p-3">{page.views.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// 5. MAIN DASHBOARD COMPONENT
const Analytics = () => {
  return (
    <div className="min-vh-100 bg-light p-4 p-md-5">
      {/* --- HEADER --- */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="h1 fw-bold text-dark mb-0">
          Interiorji Analytics Dashboard
        </h1>
        <button className="btn btn-outline-primary d-flex align-items-center">
          <FaCalendarAlt className="me-2" />
          <span>Last 30 Days</span>
        </button>
      </div>

      {/* --- STAT CARDS GRID --- */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Total Users"
            value="12,450"
            icon={FaUsers}
            change="12.5%"
            changeType="positive"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Page Views"
            value="45,890"
            icon={FaEye}
            change="8.2%"
            changeType="positive"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Bounce Rate"
            value="42.5%"
            icon={FaMousePointer}
            change="1.1%"
            changeType="negative"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Avg. Session"
            value="2m 34s"
            icon={FaClock}
            change="0.5%"
            changeType="positive"
          />
        </div>
      </div>

      {/* --- MAIN CHART & INFO GRID --- */}
      <div className="row g-4">
        {/* Left Column: Main Chart */}
        <div className="col-12 col-lg-7">
          <TrafficOverTimeChart />
        </div>

        {/* Right Column: Pie Chart & Top Pages */}
        <div className="col-12 col-lg-5">
          <TrafficSourceChart />
          <TopPagesTable />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
