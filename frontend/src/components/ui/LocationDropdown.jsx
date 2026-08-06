import React, { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaMapMarkerAlt, FaSearch, FaSpinner } from "react-icons/fa";
import locationService from "../../services/locationService";

/**
 * Accessible, keyboard-navigable Location Suggestion Dropdown
 */
const LocationDropdown = ({
  label,
  placeholder,
  value = "",
  onChange,
  onSelectLocation,
  selectedLocation,
  hint,
  disabled = false,
  extraAction = null,
  locationStatus = "IDLE", // IDLE, DETECTING, SELECTED, DENIED, ERROR
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const abortControllerRef = useRef(null);
  const containerRef = useRef(null);

  // Sync internal query with prop value when external selection changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced geocoding search (500ms)
  useEffect(() => {
    if (!query || query.trim().length < 3 || selectedLocation?.name === query) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const locations = await locationService.geocodeAddress(
          query,
          abortControllerRef.current.signal
        );
        setResults(locations.slice(0, 5));
        setIsOpen(true);
        setFocusedIndex(-1);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Geocoding service error:", err);
          setError("Geocoding unavailable. Please check address.");
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, selectedLocation]);

  // Handle Outside Click to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);
  };

  const handleSelect = (location) => {
    const locObj = {
      name: location.display_name,
      short_name: location.short_name,
      lat: location.latitude,
      lng: location.longitude,
    };
    setQuery(location.display_name);
    setResults([]);
    setIsOpen(false);
    if (onSelectLocation) onSelectLocation(locObj);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < results.length) {
        handleSelect(results[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div className="location-dropdown-field" ref={containerRef} style={{ position: "relative" }}>
      <label className="field-label">{label}</label>

      <div className="location-input-group">
        <div className="input-with-icon" style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            className="form-input"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder={placeholder}
            disabled={disabled}
            aria-autocomplete="list"
            aria-controls="location-results-list"
            aria-expanded={isOpen}
          />
          {loading && <FaSpinner className="input-spinner spinning" />}
        </div>
        {extraAction}
      </div>

      {hint && <small className="field-hint">{hint}</small>}

      {/* Geolocation Status Messages */}
      {locationStatus === "DETECTING" && <small className="status-msg info">Detecting location...</small>}
      {locationStatus === "SELECTED" && (
        <small className="status-msg success">
          <FaCheckCircle /> Selected location acquired
        </small>
      )}
      {locationStatus === "DENIED" && (
        <small className="status-msg error">
          <FaExclamationCircle /> Location permission denied. Please search address.
        </small>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          id="location-results-list"
          className="location-dropdown-menu"
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "var(--bg-surface, #ffffff)",
            border: "1px solid var(--border-color, #e2e8f0)",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            maxHeight: "240px",
            overflowY: "auto",
            marginTop: "4px",
            padding: 0,
            listStyle: "none",
          }}
        >
          {loading && (
            <li className="dropdown-item status" style={{ padding: "12px", color: "#64748b" }}>
              <FaSpinner className="spinning" /> Searching locations...
            </li>
          )}

          {!loading && error && (
            <li className="dropdown-item status error" style={{ padding: "12px", color: "#ef4444" }}>
              {error}
            </li>
          )}

          {!loading && !error && results.length === 0 && (
            <li className="dropdown-item status" style={{ padding: "12px", color: "#64748b" }}>
              No locations found
            </li>
          )}

          {!loading &&
            !error &&
            results.map((item, idx) => (
              <li
                key={idx}
                role="option"
                aria-selected={idx === focusedIndex}
                className={`dropdown-item ${idx === focusedIndex ? "focused" : ""}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setFocusedIndex(idx)}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f1f5f9",
                  background: idx === focusedIndex ? "#f1f5f9" : "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <FaMapMarkerAlt style={{ color: "#3b82f6", marginTop: "3px", flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: "block", fontSize: "0.9rem", color: "#0f172a" }}>
                      {item.short_name}
                    </strong>
                    <small style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.3, display: "block" }}>
                      {item.display_name}
                    </small>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default LocationDropdown;
