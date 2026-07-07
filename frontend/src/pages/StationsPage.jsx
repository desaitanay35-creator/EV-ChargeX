import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import StationsMap from '../components/map/StationsMap.jsx';
import StationFilters from '../components/map/StationFilters.jsx';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { getStations } from '../services/stationService.js';
import './StationsPage.css';

const DEFAULT_FILTERS = {
  availableOnly: false,
  fastOnly: false,
  normalOnly: false,
  maxPrice: 20,
};

export default function StationsPage() {
  const { onMenuClick } = useOutletContext();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('map'); // 'map' | 'list'
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { position, isLoading: isLocating, error: locationError, locate } = useGeolocation();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const data = await getStations();
      setStations(data);
      setIsLoading(false);
    })();
  }, []);

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (filters.availableOnly && s.availableSlots <= 0) return false;
      if (filters.fastOnly && !s.chargerType.toLowerCase().includes('fast')) return false;
      if (filters.normalOnly && !s.chargerType.toLowerCase().includes('normal')) return false;
      if (s.pricePerKwh > filters.maxPrice) return false;
      return true;
    });
  }, [stations, filters]);

  return (
    <>
      <Header title="Station Finder" subtitle="Browse, filter, and book charging stations near you" onMenuClick={onMenuClick} />

      <div className="stations-view-toggle">
        <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
          Map View
        </button>
        <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
          List View
        </button>
      </div>

      <StationFilters filters={filters} onChange={setFilters} onLocateMe={locate} isLocating={isLocating} />

      {locationError && <p className="location-error">⚠️ {locationError}</p>}

      {isLoading ? (
        <p className="dashboard-empty">Loading stations…</p>
      ) : view === 'map' ? (
        <div className="stations-page-map">
          <StationsMap stations={filteredStations} userPosition={position} focusPosition={position} height="560px" />
        </div>
      ) : (
        <div className="stations-list">
          {filteredStations.length === 0 && <p className="dashboard-empty">No stations match your filters.</p>}
          {filteredStations.map((station) => (
            <div className="card station-list-item" key={station.id}>
              <div>
                <h3>{station.name}</h3>
                <p className="station-list-address">{station.address}</p>
                <div className="station-list-meta">
                  <span className="badge badge-info">{station.chargerType} · {station.powerKw} kW</span>
                  <span className={`badge ${station.availableSlots > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {station.availableSlots}/{station.totalSlots} slots
                  </span>
                  <span className="badge badge-warning">₹{station.pricePerKwh}/kWh</span>
                </div>
              </div>
              <div className="station-list-actions">
                <button className="btn btn-secondary" onClick={() => navigate(`/stations/${station.id}`)}>
                  Details
                </button>
                <button
                  className="btn btn-primary"
                  disabled={station.availableSlots <= 0}
                  onClick={() => navigate(`/stations/${station.id}/book`)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
