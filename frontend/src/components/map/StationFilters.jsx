import React from 'react';
import './StationFilters.css';

export default function StationFilters({ filters, onChange, onLocateMe, isLocating }) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="station-filters card">
      <div className="station-filters-row">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => update({ availableOnly: e.target.checked })}
          />
          Available stations only
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={filters.fastOnly}
            onChange={(e) => update({ fastOnly: e.target.checked, normalOnly: false })}
          />
          Fast chargers
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={filters.normalOnly}
            onChange={(e) => update({ normalOnly: e.target.checked, fastOnly: false })}
          />
          Normal chargers
        </label>
      </div>

      <div className="station-filters-row">
        <div className="price-range-field">
          <label>Max price: ₹{filters.maxPrice} / kWh</label>
          <input
            type="range"
            min="8"
            max="20"
            step="1"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
          />
        </div>

        <button className="btn btn-secondary" onClick={onLocateMe} disabled={isLocating}>
          📍 {isLocating ? 'Locating…' : 'Use my location'}
        </button>
      </div>
    </div>
  );
}
