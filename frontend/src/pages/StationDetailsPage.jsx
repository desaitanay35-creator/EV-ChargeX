import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import StationsMap from '../components/map/StationsMap.jsx';
import { getStationById } from '../services/stationService.js';
import './StationDetailsPage.css';

export default function StationDetailsPage() {
  const { onMenuClick } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const data = await getStationById(id);
      setStation(data);
      setIsLoading(false);
    })();
  }, [id]);

  if (isLoading) {
    return (
      <>
        <Header title="Station Details" onMenuClick={onMenuClick} />
        <p className="dashboard-empty">Loading station…</p>
      </>
    );
  }

  if (!station) {
    return (
      <>
        <Header title="Station Details" onMenuClick={onMenuClick} />
        <p className="dashboard-empty">Station not found.</p>
      </>
    );
  }

  const isAvailable = station.availableSlots > 0;

  return (
    <>
      <Header title={station.name} subtitle={station.address} onMenuClick={onMenuClick} />

      <div className="station-details-grid">
        <div className="card station-details-map">
          <StationsMap stations={[station]} height="320px" />
        </div>

        <div className="card station-details-info">
          <div className="station-details-meta">
            <span className="badge badge-info">{station.chargerType} · {station.powerKw} kW</span>
            <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`}>
              {station.availableSlots}/{station.totalSlots} slots
            </span>
            <span className="badge badge-warning">₹{station.pricePerKwh}/kWh</span>
            <span className="badge badge-success">★ {station.rating}</span>
          </div>

          <h3>Amenities</h3>
          <div className="station-amenities">
            {station.amenities?.map((a) => (
              <span key={a} className="badge badge-info">{a}</span>
            ))}
          </div>

          <button
            className="btn btn-primary btn-block"
            disabled={!isAvailable}
            onClick={() => navigate(`/stations/${station.id}/book`)}
          >
            {isAvailable ? 'Book This Station' : 'No Slots Available'}
          </button>
        </div>
      </div>
    </>
  );
}
