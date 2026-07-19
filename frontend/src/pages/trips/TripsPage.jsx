import { useCallback, useState } from "react";
import { FaBatteryHalf, FaCar, FaMapMarkerAlt, FaPlus, FaRoad, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatDate } from "../../utils/format";

const emptyTrip = { vehicle: "", source: "", destination: "", distance_km: "", estimated_time: "" };

function TripsPage() {
  const loader = useCallback(async () => {
    const [trips, vehicles, stations] = await Promise.all([evService.trips.list(), evService.vehicles.list(), evService.stations.list()]);
    return { trips: toList(trips), vehicles: toList(vehicles), stations: toList(stations) };
  }, []);
  const { data, loading, error, refresh } = useResource(loader);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyTrip);
  const [saving, setSaving] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const openForm = () => {
    setForm({ ...emptyTrip, vehicle: data.vehicles[0]?.id || "" });
    setPrediction(null);
    setModalOpen(true);
  };

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const createTrip = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const vehicle = data.vehicles.find((item) => Number(item.id) === Number(form.vehicle));
      const batteryPrediction = await evService.predictBattery({
        vehicle_id: form.vehicle,
        battery_percentage: vehicle?.current_battery_percentage || 100,
        distance: form.distance_km,
      });
      const batteryNeeded = Math.max(0, Number(vehicle?.current_battery_percentage || 100) - Number(batteryPrediction.predicted_remaining_battery || 0));
      const result = await evService.trips.create({
        vehicle: form.vehicle,
        source: form.source.trim(),
        destination: form.destination.trim(),
        distance_km: form.distance_km,
        estimated_time: form.estimated_time || Math.max(1, Math.round((Number(form.distance_km) / 45) * 60)),
        estimated_battery_needed: batteryNeeded.toFixed(2),
      });
      setPrediction(result.prediction || batteryPrediction);
      toast.success("Trip planned successfully.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not plan this trip."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (trip) => {
    if (!window.confirm(`Delete the trip from ${trip.source} to ${trip.destination}?`)) return;
    try {
      await evService.trips.remove(trip.id);
      toast.success("Trip removed.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not delete the trip."));
    }
  };

  if (loading) return <LoadingState label="Loading your trip plans..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader eyebrow="AI-assisted planning" title="Trips" description="Estimate battery use and receive a charging-station recommendation before you leave." action={<button className="primary-button" disabled={!data.vehicles.length} onClick={openForm} type="button"><FaPlus /> Plan trip</button>} />
      {!data.vehicles.length && <div className="inline-alert">Add a vehicle before planning a trip.</div>}

      {data.trips.length ? (
        <div className="timeline-list">
          {data.trips.map((trip) => {
            const vehicle = data.vehicles.find((item) => Number(item.id) === Number(trip.vehicle));
            const station = data.stations.find((item) => Number(item.id) === Number(trip.suggested_station));
            return (
              <article className="timeline-card" key={trip.id}>
                <div className="trip-route-visual"><span><FaMapMarkerAlt /></span><i /><span><FaMapMarkerAlt /></span></div>
                <div className="timeline-content">
                  <div className="timeline-heading"><div><p>{formatDate(trip.created_at)}</p><h2>{trip.source} <span>→</span> {trip.destination}</h2></div><StatusBadge value={trip.trip_status} /></div>
                  <div className="trip-metrics">
                    <span><FaRoad /><strong>{trip.distance_km} km</strong><small>Distance</small></span>
                    <span><FaBatteryHalf /><strong>{trip.estimated_battery_needed}%</strong><small>Battery needed</small></span>
                    <span><FaCar /><strong>{vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${trip.vehicle}`}</strong><small>Vehicle</small></span>
                    <span><FaMapMarkerAlt /><strong>{station?.station_name || "No stop required"}</strong><small>Suggested stop</small></span>
                  </div>
                </div>
                <button className="danger-button" onClick={() => remove(trip)} type="button" aria-label="Delete trip"><FaTrash /></button>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="No trips planned" message="Create a route to see predicted battery use and charging requirements." action={data.vehicles.length ? <button className="primary-button" onClick={openForm} type="button">Plan your first trip</button> : null} />}

      {modalOpen && (
        <Modal title="Plan an EV trip" description="We use your vehicle efficiency to predict battery consumption." onClose={() => setModalOpen(false)}>
          {prediction ? (
            <div className="prediction-result">
              <span className="entity-icon"><FaBatteryHalf /></span>
              <p>Trip prediction</p>
              <h2>{prediction.battery_needed ?? prediction.predicted_remaining_battery}% battery estimate</h2>
              <div className="prediction-grid">
                <div><span>Charging required</span><strong>{prediction.charging_required ? "Yes" : "No"}</strong></div>
                <div><span>Recommended station</span><strong>{prediction.recommended_station?.station_name || "No stop needed"}</strong></div>
                <div><span>Estimated wait</span><strong>{prediction.estimated_wait_time || "0 minutes"}</strong></div>
                <div><span>Estimated cost</span><strong>₹{prediction.estimated_cost || 0}</strong></div>
              </div>
              <button className="primary-button" onClick={() => setModalOpen(false)} type="button">Done</button>
            </div>
          ) : (
            <form className="form-grid" onSubmit={createTrip}>
              <Field label="Vehicle" full><select name="vehicle" onChange={change} required value={form.vehicle}><option value="">Select vehicle</option>{data.vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} · {vehicle.current_battery_percentage}%</option>)}</select></Field>
              <Field label="Starting point" full><input name="source" onChange={change} placeholder="Ahmedabad" required value={form.source} /></Field>
              <Field label="Destination" full><input name="destination" onChange={change} placeholder="Vadodara" required value={form.destination} /></Field>
              <Field label="Distance (km)"><input min="1" name="distance_km" onChange={change} required step="0.1" type="number" value={form.distance_km} /></Field>
              <Field label="Estimated time (minutes)" hint="Leave blank to calculate automatically."><input min="1" name="estimated_time" onChange={change} type="number" value={form.estimated_time} /></Field>
              <FormActions loading={saving} onCancel={() => setModalOpen(false)} submitLabel="Generate trip plan" />
            </form>
          )}
        </Modal>
      )}
    </section>
  );
}

export default TripsPage;
