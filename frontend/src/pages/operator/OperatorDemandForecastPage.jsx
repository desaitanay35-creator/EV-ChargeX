import { useCallback, useEffect, useState } from "react";
import {
  FaBolt,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaFilter,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPlug,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrophy,
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatCurrency } from "../../utils/format";

function OperatorDemandForecastPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStationId = searchParams.get("station");

  const [selectedStationId, setSelectedStationId] = useState(initialStationId || "");
  const [stationSearchQuery, setStationSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("day"); // 'day' or 'week'

  // Daily Filter & Inspection state
  const [hourFilter, setHourFilter] = useState("ALL"); // 'ALL', 'PEAK', 'MODERATE', 'LOW'
  const [hoveredHour, setHoveredHour] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  // Weekly Filter & Inspection state
  const [weekFilter, setWeekFilter] = useState("ALL"); // 'ALL', 'HIGHEST'
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Load operator stations list
  const stationLoader = useCallback(async () => {
    const response = await evService.stations.list();
    return toList(response);
  }, []);

  const { data: stations, loading: stationsLoading, error: stationsError } = useResource(stationLoader);

  // Filter stations by search query
  const filteredStations = (stations || []).filter((st) => {
    if (!stationSearchQuery.trim()) return true;
    const q = stationSearchQuery.toLowerCase();
    return (
      st.station_name?.toLowerCase().includes(q) ||
      st.city?.toLowerCase().includes(q) ||
      st.state?.toLowerCase().includes(q) ||
      st.address?.toLowerCase().includes(q)
    );
  });

  // Set default station when stations list loads
  useEffect(() => {
    if (stations && stations.length > 0 && !selectedStationId) {
      setSelectedStationId(String(stations[0].id));
    }
  }, [stations, selectedStationId]);

  // Load forecast data for selected station & timeframe
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);

  const fetchForecast = useCallback(async () => {
    if (!selectedStationId) return;
    setForecastLoading(true);
    setForecastError(null);
    try {
      const data = await evService.getDemandForecast(selectedStationId, timeframe);
      setForecast(data);
      if (data?.hourly_forecast?.length > 0) {
        const peak = data.hourly_forecast.find((h) => h.status === "PEAK") || data.hourly_forecast[12];
        setSelectedHour(peak);
      }
      if (data?.weekly_forecast?.length > 0) {
        const peakD = data.weekly_forecast.find((d) => d.day_name === data.weekly_summary?.peak_demand_day) || data.weekly_forecast[0];
        setSelectedDay(peakD);
      }
    } catch (err) {
      setForecastError(getApiError(err, "Failed to load demand forecast."));
      toast.error("Could not fetch demand forecast data.");
    } finally {
      setForecastLoading(false);
    }
  }, [selectedStationId, timeframe]);

  useEffect(() => {
    if (selectedStationId) {
      fetchForecast();
    }
  }, [selectedStationId, timeframe, fetchForecast]);

  const handleStationSelect = (stationId) => {
    const newId = String(stationId);
    setSelectedStationId(newId);
    setSearchParams({ station: newId });
  };

  const handleHourFilterClick = (filterName) => {
    setHourFilter(filterName);
    if (forecast?.hourly_forecast) {
      if (filterName === "ALL") {
        const peak = forecast.hourly_forecast.find((h) => h.status === "PEAK") || forecast.hourly_forecast[12];
        setSelectedHour(peak);
      } else {
        const firstMatch = forecast.hourly_forecast.find((h) => h.status === filterName);
        if (firstMatch) {
          setSelectedHour(firstMatch);
        }
      }
    }
  };

  const handleWeekFilterClick = (filterName) => {
    setWeekFilter(filterName);
    if (forecast?.weekly_forecast) {
      if (filterName === "HIGHEST") {
        const peakD = forecast.weekly_forecast.find((d) => d.day_name === forecast.weekly_summary?.peak_demand_day) || forecast.weekly_forecast[0];
        setSelectedDay(peakD);
      } else {
        setSelectedDay(forecast.weekly_forecast[0]);
      }
    }
  };

  if (stationsLoading) return <LoadingState label="Loading assigned stations..." />;
  if (stationsError) return <ErrorState message={getApiError(stationsError)} />;
  if (!stations || stations.length === 0) {
    return (
      <EmptyState
        title="No Station Assigned"
        message="You do not currently have any charging stations assigned to your operator account."
      />
    );
  }

  const isWeekly = timeframe === "week";
  const activeSummary = isWeekly ? forecast?.weekly_summary : forecast?.today_summary;

  // Max session values for scaling bar heights
  const maxHourlySessionVal = forecast?.hourly_forecast
    ? Math.max(...forecast.hourly_forecast.map((h) => h.expected_sessions), 1)
    : 1;

  const maxWeeklySessionVal = forecast?.weekly_forecast
    ? Math.max(...forecast.weekly_forecast.map((d) => d.expected_sessions), 1)
    : 1;

  return (
    <section className="demand-forecast-page" style={{ paddingBottom: "3rem" }}>
      <PageHeader
        eyebrow="ML Demand Forecasting Engine"
        title="Station Demand Forecasting"
        description="Forecast expected charging sessions, energy consumption (kWh), grid load, and revenue powered by Random Forest Machine Learning."
      />

      {/* Main Controls & Station Selector Panel */}
      <div
        className="card-panel forecast-controls-bar"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          marginBottom: "1.75rem",
          padding: "1.35rem 1.5rem",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* TOP ROW: STATION SEARCH BAR & TIMEFRAME SELECTOR */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center", justifyContent: "space-between" }}>
          {/* SEARCH BAR INPUT */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: "1 1 360px", position: "relative" }}>
            <div style={{ background: "rgba(255, 102, 0, 0.15)", color: "var(--primary)", padding: "0.75rem", borderRadius: "12px", display: "flex" }}>
              <FaSearch style={{ fontSize: "1.2rem" }} />
            </div>

            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                placeholder="Search stations by name, city, or state..."
                value={stationSearchQuery}
                onChange={(e) => setStationSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 2.2rem 0.6rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  outline: "none",
                }}
              />

              {stationSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStationSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                  title="Clear Search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* TIMEFRAME SELECTOR & REFRESH */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.05)", padding: "0.3rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <button
                type="button"
                className={!isWeekly ? "primary-button" : "ghost-button"}
                onClick={() => setTimeframe("day")}
                style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem", borderRadius: "8px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <FaClock /> Daily (Hourly)
              </button>
              <button
                type="button"
                className={isWeekly ? "primary-button" : "ghost-button"}
                onClick={() => setTimeframe("week")}
                style={{ padding: "0.45rem 1.1rem", fontSize: "0.85rem", borderRadius: "8px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <FaCalendarAlt /> Entire Week (7-Day)
              </button>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={fetchForecast}
              disabled={forecastLoading}
              style={{ padding: "0.55rem 1rem", borderRadius: "10px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <FaSyncAlt className={forecastLoading ? "spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* BOTTOM ROW: STATION SELECTOR DROPDOWN & MATCHING RESULTS */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "0.9rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaMapMarkerAlt style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
              Select Station ({filteredStations.length} available):
            </span>
          </div>

          {filteredStations.length > 0 ? (
            <select
              value={selectedStationId}
              onChange={(e) => handleStationSelect(e.target.value)}
              style={{
                flex: "1 1 300px",
                padding: "0.55rem 1rem",
                borderRadius: "10px",
                border: "1px solid var(--primary)",
                background: "#0f172a",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              {filteredStations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.station_name} • {st.city}, {st.state}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: "0.85rem", color: "#ef4444", fontWeight: 600 }}>
              No stations match "{stationSearchQuery}". Try a different search term.
            </span>
          )}
        </div>
      </div>

      {forecastLoading ? (
        <LoadingState label="Executing ML RandomForest forecast models..." />
      ) : forecastError ? (
        <ErrorState message={forecastError} onRetry={fetchForecast} />
      ) : forecast && activeSummary ? (
        <>
          {/* STRUCTURED HIGH-TECH METRIC CARDS */}
          <div
            className="forecast-metrics-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
              marginBottom: "2rem",
            }}
          >
            {/* Card 1: Expected Sessions */}
            <article
              className="metric-card-structured"
              style={{
                background: "linear-gradient(145deg, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.95))",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                borderRadius: "16px",
                padding: "1.35rem",
                boxShadow: "0 8px 24px rgba(59, 130, 246, 0.12)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#60a5fa", background: "rgba(59, 130, 246, 0.15)", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>
                  ML PREDICTED VOLUME
                </span>
                <span style={{ background: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", width: 36, height: 36, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaPlug style={{ fontSize: "1.1rem" }} />
                </span>
              </div>
              <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0 0 0.3rem 0", fontWeight: 600 }}>
                {isWeekly ? "Weekly Expected Sessions" : "Daily Expected Sessions"}
              </h4>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.4rem", letterSpacing: "-0.5px" }}>
                {activeSummary.expected_sessions} <span style={{ fontSize: "1rem", fontWeight: 500, color: "#93c5fd" }}>sessions</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FaCheckCircle style={{ color: "#3b82f6" }} /> {isWeekly ? "Total for entire 7-day week" : "Total for today"}
              </div>
            </article>

            {/* Card 2: Expected Energy Demand */}
            <article
              className="metric-card-structured"
              style={{
                background: "linear-gradient(145deg, rgba(6, 78, 59, 0.4), rgba(15, 23, 42, 0.95))",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                borderRadius: "16px",
                padding: "1.35rem",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.12)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#34d399", background: "rgba(16, 185, 129, 0.15)", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>
                  ESTIMATED GRID ENERGY
                </span>
                <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399", width: 36, height: 36, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaBolt style={{ fontSize: "1.1rem" }} />
                </span>
              </div>
              <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0 0 0.3rem 0", fontWeight: 600 }}>
                {isWeekly ? "Weekly Energy Demand" : "Daily Energy Demand"}
              </h4>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.4rem", letterSpacing: "-0.5px" }}>
                {activeSummary.expected_energy_kwh} <span style={{ fontSize: "1rem", fontWeight: 500, color: "#6ee7b7" }}>kWh</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FaBolt style={{ color: "#10b981" }} /> {isWeekly ? "Total 7-day grid load forecast" : "Total today grid load forecast"}
              </div>
            </article>

            {/* Card 3: Peak Demand Window / Peak Day */}
            <article
              className="metric-card-structured"
              style={{
                background: "linear-gradient(145deg, rgba(120, 53, 15, 0.4), rgba(15, 23, 42, 0.95))",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                borderRadius: "16px",
                padding: "1.35rem",
                boxShadow: "0 8px 24px rgba(245, 158, 11, 0.12)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#fbbf24", background: "rgba(245, 158, 11, 0.15)", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>
                  {isWeekly ? "PEAK DEMAND DAY" : "PEAK DEMAND HOUR"}
                </span>
                <span style={{ background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", width: 36, height: 36, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaClock style={{ fontSize: "1.1rem" }} />
                </span>
              </div>
              <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0 0 0.3rem 0", fontWeight: 600 }}>
                {isWeekly ? "Peak Demand Day" : "Peak Demand Window"}
              </h4>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.4rem", letterSpacing: "-0.5px" }}>
                {isWeekly ? activeSummary.peak_demand_day : activeSummary.peak_demand_hour}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#fcd34d", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FaTrophy style={{ color: "#f59e0b" }} /> Busiest period for station
              </div>
            </article>

            {/* Card 4: Projected Revenue */}
            <article
              className="metric-card-structured"
              style={{
                background: "linear-gradient(145deg, rgba(88, 28, 135, 0.4), rgba(15, 23, 42, 0.95))",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                borderRadius: "16px",
                padding: "1.35rem",
                boxShadow: "0 8px 24px rgba(168, 85, 247, 0.12)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#c084fc", background: "rgba(168, 85, 247, 0.15)", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>
                  EXPECTED CHARGING INCOME
                </span>
                <span style={{ background: "rgba(168, 85, 247, 0.2)", color: "#c084fc", width: 36, height: 36, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaMoneyBillWave style={{ fontSize: "1.1rem" }} />
                </span>
              </div>
              <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0 0 0.3rem 0", fontWeight: 600 }}>
                {isWeekly ? "Weekly Projected Revenue" : "Daily Projected Revenue"}
              </h4>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.4rem", letterSpacing: "-0.5px" }}>
                {formatCurrency(activeSummary.projected_revenue_inr)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#e9d5ff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FaChartLine style={{ color: "#a855f7" }} /> {isWeekly ? "Estimated 7-day revenue" : "Estimated today revenue"}
              </div>
            </article>
          </div>

          {/* MAIN VISUALIZER: HOURLY VS WEEKLY */}
          {!isWeekly ? (
            /* 24-HOUR DAILY HOURLY FORECAST VISUALIZER */
            <article className="card-panel" style={{ marginBottom: "2rem", padding: "1.75rem", borderRadius: "18px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 0.25rem 0", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <FaChartBar style={{ color: "var(--primary)" }} /> Interactive 24-Hour Demand Visualizer
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                    Click or filter any demand intensity to highlight specific hour windows on the bar chart.
                  </p>
                </div>

                {/* Demand Intensity Filter */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255, 255, 255, 0.04)", padding: "0.35rem 0.5rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", padding: "0 0.3rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <FaFilter /> Filter:
                  </span>
                  {["ALL", "PEAK", "MODERATE", "LOW"].map((f) => {
                    const matchCount = forecast.hourly_forecast.filter((h) => f === "ALL" || h.status === f).length;
                    const isActive = hourFilter === f;

                    let activeBg = "var(--primary)";
                    let activeColor = "#ffffff";
                    if (isActive) {
                      if (f === "PEAK") activeBg = "#dc2626";
                      if (f === "MODERATE") activeBg = "#2563eb";
                      if (f === "LOW") activeBg = "#059669";
                    }

                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => handleHourFilterClick(f)}
                        style={{
                          padding: "0.35rem 0.8rem",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          border: isActive ? `1px solid ${activeBg}` : "1px solid transparent",
                          cursor: "pointer",
                          background: isActive ? activeBg : "rgba(255, 255, 255, 0.05)",
                          color: isActive ? activeColor : "var(--text-muted)",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: isActive ? `0 0 10px ${activeBg}88` : "none",
                        }}
                      >
                        {f} ({matchCount})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC HIGH-CONTRAST INTERACTIVE BAR CHART */}
              <div
                style={{
                  background: "rgba(10, 15, 26, 0.9)",
                  borderRadius: "14px",
                  padding: "1.75rem 1rem 1rem",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(24, 1fr)",
                    gap: "6px",
                    alignItems: "flex-end",
                    height: "200px",
                    paddingBottom: "0.5rem",
                  }}
                >
                  {forecast.hourly_forecast.map((item) => {
                    const isHovered = hoveredHour?.hour === item.hour;
                    const isSelected = selectedHour?.hour === item.hour;
                    const matchesFilter = hourFilter === "ALL" || item.status === hourFilter;

                    const heightPct = Math.max(14, Math.min(100, (item.expected_sessions / maxHourlySessionVal) * 100));

                    let primaryColor = item.status === "PEAK" ? "#ef4444" : item.status === "MODERATE" ? "#3b82f6" : "#10b981";
                    let barGradient =
                      item.status === "PEAK"
                        ? "linear-gradient(to top, #b91c1c, #ef4444, #f87171)"
                        : item.status === "MODERATE"
                        ? "linear-gradient(to top, #1d4ed8, #3b82f6, #60a5fa)"
                        : "linear-gradient(to top, #047857, #10b981, #34d399)";

                    let opacityVal = 0.8;
                    let transformVal = "scaleY(1)";
                    let boxShadowVal = "none";

                    if (matchesFilter) {
                      opacityVal = 1.0;
                      if (hourFilter !== "ALL" || isSelected || isHovered) {
                        transformVal = "scaleY(1.06)";
                        boxShadowVal = `0 0 14px ${primaryColor}, 0 0 4px ${primaryColor}`;
                      }
                    } else {
                      opacityVal = 0.12;
                      transformVal = "scaleY(0.95)";
                    }

                    return (
                      <div
                        key={item.hour}
                        onMouseEnter={() => setHoveredHour(item)}
                        onMouseLeave={() => setHoveredHour(null)}
                        onClick={() => setSelectedHour(item)}
                        style={{
                          height: `${heightPct}%`,
                          background: barGradient,
                          borderRadius: "5px 5px 2px 2px",
                          opacity: opacityVal,
                          transform: transformVal,
                          boxShadow: boxShadowVal,
                          cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          position: "relative",
                        }}
                        title={`${item.time_label}: ${item.expected_sessions} sessions (${item.status})`}
                      >
                        {matchesFilter && (isSelected || (hourFilter !== "ALL" && item.status === hourFilter)) && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-14px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: primaryColor,
                              boxShadow: `0 0 10px ${primaryColor}, 0 0 4px #ffffff`,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Hour Labels */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: "6px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.6rem" }}>
                  {forecast.hourly_forecast.map((item) => {
                    const matchesFilter = hourFilter === "ALL" || item.status === hourFilter;
                    const isSelected = selectedHour?.hour === item.hour;
                    return (
                      <span
                        key={item.hour}
                        onClick={() => setSelectedHour(item)}
                        style={{
                          fontSize: "0.65rem",
                          color: isSelected ? "var(--primary)" : matchesFilter ? "#e2e8f0" : "rgba(255,255,255,0.2)",
                          fontWeight: isSelected || matchesFilter ? 700 : 400,
                          cursor: "pointer",
                        }}
                      >
                        {item.hour % 3 === 0 ? `${item.hour}h` : ""}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* INSPECTED HOUR DETAILS PANEL */}
              {selectedHour && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
                    border: `1.5px solid ${selectedHour.status === "PEAK" ? "#ef4444" : selectedHour.status === "MODERATE" ? "#3b82f6" : "#10b981"}`,
                    boxShadow: `0 8px 24px ${selectedHour.status === "PEAK" ? "rgba(239, 68, 68, 0.25)" : selectedHour.status === "MODERATE" ? "rgba(59, 130, 246, 0.25)" : "rgba(16, 185, 129, 0.25)"}`,
                    borderRadius: "14px",
                    padding: "1.35rem 1.5rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    alignItems: "center",
                    justify: "space-between",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        background: selectedHour.status === "PEAK" ? "rgba(239, 68, 68, 0.2)" : selectedHour.status === "MODERATE" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
                        color: selectedHour.status === "PEAK" ? "#ef4444" : selectedHour.status === "MODERATE" ? "#3b82f6" : "#10b981",
                        display: "inline-block",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {selectedHour.status} DEMAND WINDOW
                    </span>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                      Hour Slot: {selectedHour.time_label} – {(selectedHour.hour + 1) % 24}:00
                    </h3>
                  </div>

                  <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Predicted Sessions</span>
                      <strong style={{ fontSize: "1.25rem", color: "#ffffff" }}>{selectedHour.expected_sessions} sessions</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Energy Forecast</span>
                      <strong style={{ fontSize: "1.25rem", color: "#34d399" }}>{selectedHour.expected_energy_kwh} kWh</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Charger Utilization</span>
                      <strong style={{ fontSize: "1.25rem", color: selectedHour.status === "PEAK" ? "#ef4444" : "#60a5fa" }}>
                        {selectedHour.utilization_pct}%
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Projected Revenue</span>
                      <strong style={{ fontSize: "1.25rem", color: "#c084fc" }}>
                        {formatCurrency(selectedHour.projected_revenue_inr)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ) : (
            /* 7-DAY INTERACTIVE WEEKLY BAR CHART & VISUALIZER */
            <article className="card-panel" style={{ marginBottom: "2rem", padding: "1.75rem", borderRadius: "18px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 0.25rem 0", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <FaCalendarAlt style={{ color: "var(--primary)" }} /> Interactive 7-Day Weekly Demand Visualizer
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                    Click or filter between ALL days and HIGHEST peak day for {forecast.station_name}
                  </p>
                </div>

                {/* WEEKLY FILTER BUTTONS: ALL vs HIGHEST */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255, 255, 255, 0.04)", padding: "0.35rem 0.5rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", padding: "0 0.3rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <FaFilter /> Filter:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleWeekFilterClick("ALL")}
                    style={{
                      padding: "0.35rem 0.9rem",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      border: weekFilter === "ALL" ? "1px solid var(--primary)" : "1px solid transparent",
                      cursor: "pointer",
                      background: weekFilter === "ALL" ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
                      color: weekFilter === "ALL" ? "#ffffff" : "var(--text-muted)",
                      transition: "all 0.2s ease",
                      boxShadow: weekFilter === "ALL" ? "0 0 10px rgba(255, 102, 0, 0.4)" : "none",
                    }}
                  >
                    ALL (7 Days)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWeekFilterClick("HIGHEST")}
                    style={{
                      padding: "0.35rem 0.9rem",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      border: weekFilter === "HIGHEST" ? "1px solid #f59e0b" : "1px solid transparent",
                      cursor: "pointer",
                      background: weekFilter === "HIGHEST" ? "#f59e0b" : "rgba(255, 255, 255, 0.05)",
                      color: weekFilter === "HIGHEST" ? "#ffffff" : "var(--text-muted)",
                      transition: "all 0.2s ease",
                      boxShadow: weekFilter === "HIGHEST" ? "0 0 12px rgba(245, 158, 11, 0.6)" : "none",
                    }}
                  >
                    <FaTrophy /> HIGHEST ({activeSummary.peak_demand_day})
                  </button>
                </div>
              </div>

              {/* 7-DAY WEEKLY BAR GRAPH */}
              <div
                style={{
                  background: "rgba(10, 15, 26, 0.9)",
                  borderRadius: "14px",
                  padding: "1.75rem 1.5rem 1rem",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "1.25rem",
                    alignItems: "flex-end",
                    height: "220px",
                    paddingBottom: "0.5rem",
                  }}
                >
                  {forecast.weekly_forecast.map((day) => {
                    const isPeakDay = day.day_name === activeSummary.peak_demand_day;
                    const isHovered = hoveredDay?.day_index === day.day_index;
                    const isSelected = selectedDay?.day_index === day.day_index;
                    const matchesFilter = weekFilter === "ALL" || (weekFilter === "HIGHEST" && isPeakDay);

                    const heightPct = Math.max(20, Math.min(100, (day.expected_sessions / maxWeeklySessionVal) * 100));

                    let barGradient = isPeakDay
                      ? "linear-gradient(to top, #b45309, #f59e0b, #fbbf24)"
                      : day.is_today
                      ? "linear-gradient(to top, #1d4ed8, #3b82f6, #60a5fa)"
                      : "linear-gradient(to top, #334155, #64748b, #94a3b8)";

                    let opacityVal = 0.85;
                    let transformVal = "scaleY(1)";
                    let boxShadowVal = "none";

                    if (matchesFilter) {
                      opacityVal = 1.0;
                      if (weekFilter === "HIGHEST" || isSelected || isHovered) {
                        transformVal = "scaleY(1.05)";
                        boxShadowVal = `0 0 16px ${isPeakDay ? "#f59e0b" : day.is_today ? "#3b82f6" : "rgba(255,255,255,0.4)"}`;
                      }
                    } else {
                      opacityVal = 0.15;
                      transformVal = "scaleY(0.95)";
                    }

                    return (
                      <div
                        key={day.day_index}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => setSelectedDay(day)}
                        style={{
                          height: `${heightPct}%`,
                          background: barGradient,
                          borderRadius: "8px 8px 3px 3px",
                          opacity: opacityVal,
                          transform: transformVal,
                          boxShadow: boxShadowVal,
                          cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          justify: "flex-start",
                          alignItems: "center",
                          paddingTop: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#ffffff", background: "rgba(0,0,0,0.4)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                          {day.expected_sessions}
                        </span>

                        {isPeakDay && (
                          <span
                            style={{
                              position: "absolute",
                              top: "-22px",
                              background: "rgba(245, 158, 11, 0.25)",
                              color: "#fbbf24",
                              border: "1px solid #f59e0b",
                              fontSize: "0.6rem",
                              fontWeight: 800,
                              padding: "0.1rem 0.4rem",
                              borderRadius: "10px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            PEAK
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Day Labels */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1.25rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.75rem" }}>
                  {forecast.weekly_forecast.map((day) => {
                    const isSelected = selectedDay?.day_index === day.day_index;
                    return (
                      <div
                        key={day.day_index}
                        onClick={() => setSelectedDay(day)}
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? "var(--primary)" : "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        {day.day_name}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* INSPECTED DAY DETAILS PANEL */}
              {selectedDay && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
                    border: `1.5px solid ${selectedDay.day_name === activeSummary.peak_demand_day ? "#f59e0b" : "var(--primary)"}`,
                    boxShadow: `0 8px 24px ${selectedDay.day_name === activeSummary.peak_demand_day ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 102, 0, 0.25)"}`,
                    borderRadius: "14px",
                    padding: "1.35rem 1.5rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    alignItems: "center",
                    justify: "space-between",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        background: selectedDay.day_name === activeSummary.peak_demand_day ? "rgba(245, 158, 11, 0.2)" : "rgba(59, 130, 246, 0.2)",
                        color: selectedDay.day_name === activeSummary.peak_demand_day ? "#fbbf24" : "#60a5fa",
                        display: "inline-block",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {selectedDay.day_name === activeSummary.peak_demand_day ? "HIGHEST PEAK DAY" : "WEEKDAY FORECAST"}
                    </span>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                      {selectedDay.day_name} Predictions
                    </h3>
                  </div>

                  <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Predicted Sessions</span>
                      <strong style={{ fontSize: "1.25rem", color: "#ffffff" }}>{selectedDay.expected_sessions} sessions</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Energy Forecast</span>
                      <strong style={{ fontSize: "1.25rem", color: "#34d399" }}>{selectedDay.expected_energy_kwh} kWh</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Projected Revenue</span>
                      <strong style={{ fontSize: "1.25rem", color: "#c084fc" }}>
                        {formatCurrency(selectedDay.projected_revenue_inr)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </article>
          )}
        </>
      ) : null}
    </section>
  );
}

export default OperatorDemandForecastPage;
