import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  Navigation, Zap, Compass, MapPin, Clock, Battery, 
  HelpCircle, ChevronRight, AlertTriangle, ShieldCheck 
} from 'lucide-react';

export default function Trips({ showToast }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  
  // Trip details
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState('80');
  const [estTime, setEstTime] = useState('120');
  const [currentBattery, setCurrentBattery] = useState('80');
  
  // Coordinates lookup state
  const [activeCoords, setActiveCoords] = useState({
    source: { lat: 23.0225, lng: 72.5714 },
    destination: { lat: 23.1147, lng: 72.5389 }
  });

  const [routeGeometry, setRouteGeometry] = useState(null);
  const [ocmStations, setOcmStations] = useState([]);

  // Prediction states
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [bookingLauncher, setBookingLauncher] = useState(false);
  
  // Booking form states
  const [chargers, setChargers] = useState([]);
  const [selectedChargerId, setSelectedChargerId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingStartTime, setBookingStartTime] = useState('10:00');
  const [bookingEndTime, setBookingEndTime] = useState('11:30');
  const [bookingLoading, setBookingLoading] = useState(false);

  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const vehiclesData = await api('/vehicles/');
        setVehicles(vehiclesData || []);
        if (vehiclesData && vehiclesData.length > 0) {
          setSelectedVehicleId(vehiclesData[0].id);
          setCurrentBattery(vehiclesData[0].current_battery_percentage);
        }
      } catch (err) {
        showToast('Error loading vehicles', 'error');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Update battery input when vehicle selection changes
  const handleVehicleChange = (e) => {
    const id = e.target.value;
    setSelectedVehicleId(id);
    const vehicle = vehicles.find(v => v.id.toString() === id.toString());
    if (vehicle) {
      setCurrentBattery(vehicle.current_battery_percentage);
    }
  };

  // Handle ML predictions and load Leaflet map
  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      showToast('Please register and select a vehicle first', 'error');
      return;
    }
    setPredicting(true);
    setPredictionResult(null);
    setBookingLauncher(false);
    setRouteGeometry(null);
    setOcmStations([]);

    try {
      const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImYwYmNiY2IwMDA4MjQwOWVhOTRlOGIyYjUzMTRhOWE3IiwiaCI6Im11cm11cjY0In0=';
      
      // 1. Geocode Source location
      let srcLat = 23.0225;
      let srcLng = 72.5714;
      try {
        const srcRes = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(source || 'Ahmedabad')}`);
        const srcJson = await srcRes.json();
        if (srcJson.features && srcJson.features.length > 0) {
          const coords = srcJson.features[0].geometry.coordinates;
          srcLng = coords[0];
          srcLat = coords[1];
        }
      } catch (err) {
        console.error('Source geocoding failed, using fallback coords', err);
      }

      // 2. Geocode Destination location
      let destLat = 23.1147;
      let destLng = 72.5389;
      try {
        const destRes = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(destination || 'Gandhinagar')}`);
        const destJson = await destRes.json();
        if (destJson.features && destJson.features.length > 0) {
          const coords = destJson.features[0].geometry.coordinates;
          destLng = coords[0];
          destLat = coords[1];
        }
      } catch (err) {
        console.error('Destination geocoding failed, using fallback coords', err);
      }

      const newCoords = {
        source: { lat: srcLat, lng: srcLng },
        destination: { lat: destLat, lng: destLng }
      };
      setActiveCoords(newCoords);

      // 3. Fetch route directions from ORS
      let finalDistance = parseFloat(distance);
      let finalTime = parseFloat(estTime);
      let geometry = null;
      try {
        const routeRes = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${srcLng},${srcLat}&end=${destLng},${destLat}`);
        const routeJson = await routeRes.json();
        if (routeJson.features && routeJson.features.length > 0) {
          const summary = routeJson.features[0].properties.summary;
          finalDistance = parseFloat((summary.distance / 1000.0).toFixed(2));
          finalTime = Math.round(summary.duration / 60.0);
          
          setDistance(finalDistance.toString());
          setEstTime(finalTime.toString());
          
          geometry = routeJson.features[0].geometry.coordinates; // Array of [lng, lat]
          setRouteGeometry(geometry);
        }
      } catch (err) {
        console.error('Route directions lookup failed', err);
      }

      // 4. Fetch POIs from OpenChargeMap near destination
      try {
        const ocmKey = 'd3a7692a-4306-429a-add1-360ee04ea82e';
        const ocmRes = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&latitude=${destLat}&longitude=${destLng}&distance=15&distanceunit=KM&maxresults=10&key=${ocmKey}`);
        const ocmJson = await ocmRes.json();
        setOcmStations(ocmJson || []);
      } catch (err) {
        console.error('OpenChargeMap search failed', err);
      }

      // 5. Call Battery Usage prediction
      const batteryPred = await api('/ml/battery/', {
        method: 'POST',
        body: JSON.stringify({
          battery_percentage: currentBattery,
          distance: finalDistance,
          vehicle_id: selectedVehicleId
        })
      });

      // 6. Call Station Recommendation
      const stationPred = await api('/ml/station/', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: selectedVehicleId,
          destination_latitude: destLat,
          destination_longitude: destLng
        })
      });

      setPredictionResult({
        battery: batteryPred,
        station: stationPred
      });

      showToast('AI range predictions computed successfully!');
    } catch (err) {
      showToast(err.message || 'Range prediction failed', 'error');
    } finally {
      setPredicting(false);
    }
  };

  // Mount/Update interactive map
  useEffect(() => {
    if (!predictionResult || !window.L || !document.getElementById('map-view')) return;

    // Clean up previous map if exists
    if (leafletMapInstance.current) {
      leafletMapInstance.current.remove();
    }

    const recStation = predictionResult.station.recommended_station;
    const centerLat = recStation ? parseFloat(recStation.latitude) : activeCoords.source.lat;
    const centerLng = recStation ? parseFloat(recStation.longitude) : activeCoords.source.lng;

    // Initialize Leaflet Map
    const map = window.L.map('map-view').setView([centerLat, centerLng], 11);
    leafletMapInstance.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Source marker
    window.L.marker([activeCoords.source.lat, activeCoords.source.lng])
      .addTo(map)
      .bindPopup(`<strong>Trip Origin:</strong> ${source || 'Source Location'}`)
      .openPopup();

    // Destination marker
    window.L.marker([activeCoords.destination.lat, activeCoords.destination.lng])
      .addTo(map)
      .bindPopup(`<strong>Trip Destination:</strong> ${destination || 'Gandhinagar'}`);

    // Plot recommended station
    if (recStation) {
      const stationIcon = window.L.divIcon({
        className: 'custom-station-icon',
        html: `<div style="background-color: var(--color-primary); width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--color-primary)"></div>`,
        iconSize: [14, 14]
      });

      window.L.marker([parseFloat(recStation.latitude), parseFloat(recStation.longitude)], { icon: stationIcon })
        .addTo(map)
        .bindPopup(`<strong>Recommended Station:</strong> ${recStation.station_name}<br/>Wait time: ${predictionResult.station.estimated_wait_time} mins`)
        .openPopup();
    }

    // Plot OpenChargeMap stations
    if (ocmStations && ocmStations.length > 0) {
      ocmStations.forEach(poi => {
        if (poi.AddressInfo) {
          const ocmIcon = window.L.divIcon({
            className: 'ocm-station-icon',
            html: `<div style="background-color: var(--color-secondary); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px var(--color-secondary)"></div>`,
            iconSize: [12, 12]
          });
          
          const title = poi.AddressInfo.Title;
          const power = poi.Connections?.[0]?.PowerKW ? `${poi.Connections[0].PowerKW}kW` : 'Unknown';
          
          window.L.marker([poi.AddressInfo.Latitude, poi.AddressInfo.Longitude], { icon: ocmIcon })
            .addTo(map)
            .bindPopup(`<strong>OpenChargeMap POI:</strong> ${title}<br/>Power: ${power}`);
        }
      });
    }

    // Draw route polyline
    if (routeGeometry && routeGeometry.length > 0) {
      const latLngs = routeGeometry.map(coord => [coord[1], coord[0]]);
      const polyline = window.L.polyline(latLngs, {
        color: 'var(--color-secondary)',
        weight: 5,
        opacity: 0.75
      }).addTo(map);
      
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    } else {
      const markerList = [
        [activeCoords.source.lat, activeCoords.source.lng],
        [activeCoords.destination.lat, activeCoords.destination.lng]
      ];
      if (recStation) {
        markerList.push([parseFloat(recStation.latitude), parseFloat(recStation.longitude)]);
      }
      const bounds = window.L.latLngBounds(markerList);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [predictionResult, routeGeometry, ocmStations, activeCoords]);

  // Open booking configuration modal
  const openBookingLauncher = async () => {
    const recStation = predictionResult?.station?.recommended_station;
    if (!recStation) return;
    setBookingLauncher(true);
    try {
      const chargersData = await api('/charging/chargers/');
      // Filter chargers matching the recommended station and connector type
      const matched = (chargersData || []).filter(c => 
        c.station.toString() === recStation.id.toString()
      );
      setChargers(matched);
      if (matched.length > 0) {
        setSelectedChargerId(matched[0].id);
      }
    } catch (err) {
      showToast('Failed to fetch chargers details', 'error');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const recStation = predictionResult?.station?.recommended_station;
    if (!recStation || !selectedChargerId) {
      showToast('Please select a charger', 'error');
      return;
    }
    setBookingLoading(true);
    try {
      // 1. First save the trip in the database
      const savedTrip = await api('/trips/', {
        method: 'POST',
        body: JSON.stringify({
          vehicle: selectedVehicleId,
          source: source || 'Ahmedabad',
          destination: destination || 'Gandhinagar',
          distance_km: distance,
          estimated_time: estTime,
          estimated_battery_needed: (currentBattery - predictionResult.battery.predicted_remaining_battery).toFixed(2),
          suggested_station: recStation.id,
          trip_status: 'PLANNED'
        })
      });

      // 2. Create the slot booking linked to this trip
      await api('/bookings/', {
        method: 'POST',
        body: JSON.stringify({
          trip: savedTrip.id,
          station: recStation.id,
          charger: selectedChargerId,
          booking_date: bookingDate,
          booking_start_time: bookingStartTime,
          booking_end_time: bookingEndTime,
          estimated_duration: 90 // Minutes default
        })
      });

      showToast('Trip saved and charger slot booked successfully!');
      setBookingLauncher(false);
      setPredictionResult(null);
    } catch (err) {
      showToast(err.message || 'Failed to book slot', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Syncing range prediction modules...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem' }}>AI Route Planner</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Predict battery usage and recommend optimized charging stations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Planner input form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={20} color="var(--color-primary)" />
            Plan Journey Parameters
          </h3>
          <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Select EV Vehicle</label>
              <select className="form-control" value={selectedVehicleId} onChange={handleVehicleChange} required>
                <option value="">-- Choose EV --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.registration_number})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Journey Origin</label>
                <input type="text" placeholder="e.g. Ahmedabad" className="form-control" value={source} onChange={e => setSource(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Journey Destination</label>
                <input type="text" placeholder="e.g. Gandhinagar" className="form-control" value={destination} onChange={e => setDestination(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Distance (km)</label>
                <input type="number" className="form-control" value={distance} onChange={e => setDistance(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Est. Duration (mins)</label>
                <input type="number" className="form-control" value={estTime} onChange={e => setEstTime(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Current SoC (%)</label>
                <input type="number" className="form-control" value={currentBattery} onChange={e => setCurrentBattery(e.target.value)} min="0" max="100" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '10px' }} disabled={predicting}>
              {predicting ? 'Calculating AI Range Predictions...' : 'Analyze Range & Recommend Station'}
            </button>
          </form>
        </div>

        {/* Dynamic AI Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {predictionResult ? (
            <>
              {/* Telemetry results card */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary)' }}>AI Range Diagnostics</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Battery size={24} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicted SoC on Arrival</div>
                      <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}>
                        {predictionResult.battery.predicted_remaining_battery}%
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Zap size={24} color="var(--color-secondary)" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Energy Consumption</div>
                      <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}>
                        {predictionResult.battery.energy_consumed_kwh} kWh
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Range safety alert */}
                {predictionResult.battery.predicted_remaining_battery < 20 ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '12px',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontSize: '0.8rem'
                  }}>
                    <AlertTriangle size={18} />
                    <span>Warning: Battery level critical on arrival! Recommending immediate charging point route.</span>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '12px',
                    borderRadius: '8px',
                    color: '#34d399',
                    fontSize: '0.8rem'
                  }}>
                    <ShieldCheck size={18} />
                    <span>Battery levels within safe range parameters. Range optimizer active.</span>
                  </div>
                )}

                {/* Station Recommendation */}
                {predictionResult.station.recommended_station ? (
                  <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recommended Smart Charger Station</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem' }}>{predictionResult.station.recommended_station.station_name}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{predictionResult.station.recommended_station.address}</span>
                      </div>
                      <span className="status-badge status-available">
                        Wait: {predictionResult.station.estimated_wait_time}m
                      </span>
                    </div>
                    <button className="btn btn-secondary" style={{ width: '100%', height: '38px', marginTop: '4px' }} onClick={openBookingLauncher}>
                      Reserve Charger Slot
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No compatible station recommendations found in area.</p>
                )}
              </div>

              {/* Map view container */}
              <div className="glass-panel" id="map-view" style={{ height: '220px', borderRadius: '12px', overflow: 'hidden' }}></div>
            </>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center', minHeight: '340px' }}>
              <Navigation size={40} color="var(--text-muted)" style={{ opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>Awaiting Route Telemetry</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px' }}>Fill details and request optimization analysis to evaluate charging logistics.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Launcher Modal */}
      {bookingLauncher && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Reserve Charging Port Slot</h3>
              <button onClick={() => setBookingLauncher(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>Close</button>
            </div>

            <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Select Charging Point</label>
                <select className="form-control" value={selectedChargerId} onChange={e => setSelectedChargerId(e.target.value)} required>
                  <option value="">-- Choose Charger --</option>
                  {chargers.map(c => (
                    <option key={c.id} value={c.id}>{c.charger_name} ({c.charger_type} - {c.connector_type} - {c.power_output_kw}kW)</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Booking Date</label>
                <input type="date" className="form-control" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" className="form-control" value={bookingStartTime} onChange={e => setBookingStartTime(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" className="form-control" value={bookingEndTime} onChange={e => setBookingEndTime(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={bookingLoading}>
                {bookingLoading ? 'Reserving Charger Slot...' : 'Confirm Reservation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
