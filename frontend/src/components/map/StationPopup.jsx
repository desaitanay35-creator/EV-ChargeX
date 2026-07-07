import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StationPopup.css';

export default function StationPopup({ station }) {
  const navigate = useNavigate();
  const isAvailable = station.availableSlots > 0;

  return (
    <div className="station-popup">
      <h3>{station.name}</h3>
      <p className="station-popup-address">{station.address}</p>

      <div className="station-popup-row">
        <span>Charger type</span>
        <strong>{station.chargerType} · {station.powerKw} kW</strong>
      </div>
      <div className="station-popup-row">
        <span>Available slots</span>
        <strong className={isAvailable ? 'text-success' : 'text-danger'}>
          {station.availableSlots} / {station.totalSlots}
        </strong>
      </div>
      <div className="station-popup-row">
        <span>Pricing</span>
        <strong>₹{station.pricePerKwh} / kWh</strong>
      </div>

      <div className="station-popup-actions">
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/stations/${station.id}`)}
        >
          Details
        </button>
        <button
          className="btn btn-primary"
          disabled={!isAvailable}
          onClick={() => navigate(`/stations/${station.id}/book`)}
        >
          {isAvailable ? 'Book Now' : 'Full'}
        </button>
      </div>
    </div>
  );
}
