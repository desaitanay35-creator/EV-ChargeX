import { useCallback, useMemo, useState } from "react";
import {
  FaClock,
  FaEdit,
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
  FaRegHeart,
  FaStar,
  FaTrash,
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  EmptyState,
  ErrorState,
  Field,
  FormActions,
  LoadingState,
  Modal,
  PageHeader,
  StatusBadge,
} from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatTime } from "../../utils/format";

const emptyStation = {
  station_name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  opening_time: "06:00",
  closing_time: "23:00",
  contact_number: "",
  email: "",
  amenities: "",
  status: "OPEN",
};

function StationsPage() {
  const { role } = useAuth();
  const normalizedRole = role?.toUpperCase();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modal, setModal] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationForm, setStationForm] = useState(emptyStation);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [saving, setSaving] = useState(false);

  const loader = useCallback(async () => {
    const [stations, chargers, favorites, reviews] = await Promise.all([
      evService.stations.list(),
      evService.chargers.list(),
      evService.favorites.list(),
      evService.reviews.list(),
    ]);
    return {
      stations: toList(stations),
      chargers: toList(chargers),
      favorites: toList(favorites),
      reviews: toList(reviews),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loader);

  const filteredStations = useMemo(() => {
    if (!data) return [];
    const requestedId = searchParams.get("station");
    const lowered = query.trim().toLowerCase();

    return data.stations
      .filter((station) => !requestedId || station.id.toString() === requestedId || query)
      .filter((station) => statusFilter === "ALL" || station.status === statusFilter)
      .filter((station) => !lowered || [station.station_name, station.city, station.state, station.address].some((value) => value?.toLowerCase().includes(lowered)));
  }, [data, query, searchParams, statusFilter]);

  const toggleFavorite = async (station) => {
    const favorite = data.favorites.find((item) => Number(item.station) === Number(station.id));
    try {
      if (favorite) {
        await evService.favorites.remove(favorite.id);
        toast.success("Removed from favourites.");
      } else {
        await evService.favorites.create({ station: station.id });
        toast.success("Station saved to favourites.");
      }
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not update favourites."));
    }
  };

  const openStationForm = (station = null) => {
    setSelectedStation(station);
    setStationForm(
      station
        ? Object.fromEntries(Object.keys(emptyStation).map((key) => [key, station[key] ?? ""]))
        : emptyStation
    );
    setModal("station");
  };

  const saveStation = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (selectedStation) {
        await evService.stations.update(selectedStation.id, stationForm);
        toast.success("Station updated.");
      } else {
        await evService.stations.create(stationForm);
        toast.success("Station created.");
      }
      setModal(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not save the station."));
    } finally {
      setSaving(false);
    }
  };

  const deleteStation = async (station) => {
    if (!window.confirm(`Delete ${station.station_name}? This may affect its chargers and bookings.`)) return;
    try {
      await evService.stations.remove(station.id);
      toast.success("Station deleted.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not delete the station."));
    }
  };

  const openReview = (station) => {
    setSelectedStation(station);
    setReviewForm({ rating: "5", comment: "" });
    setModal("review");
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await evService.reviews.create({
        station: selectedStation.id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });
      toast.success("Review submitted.");
      setModal(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not submit the review."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Discovering charging stations..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader
        eyebrow="Charging network"
        title="Find a charging station"
        description="Compare status, compatible chargers, ratings and amenities before you reserve."
        action={normalizedRole === "OPERATOR" ? <button className="primary-button" onClick={() => openStationForm()} type="button"><FaPlus /> Add station</button> : null}
      />

      <div className="page-toolbar">
        <input className="toolbar-input" onChange={(event) => setQuery(event.target.value)} placeholder="Search by station, city or address" value={query} />
        <select className="toolbar-select" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
          <option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="CLOSED">Closed</option><option value="MAINTENANCE">Maintenance</option>
        </select>
        <span className="toolbar-count">{filteredStations.length} station{filteredStations.length === 1 ? "" : "s"}</span>
      </div>

      {filteredStations.length ? (
        <div className="entity-card-grid station-grid">
          {filteredStations.map((station) => {
            const stationChargers = data.chargers.filter((charger) => Number(charger.station) === Number(station.id));
            const available = stationChargers.filter((charger) => charger.status === "AVAILABLE").length;
            const isFavorite = data.favorites.some((favorite) => Number(favorite.station) === Number(station.id));
            const reviewCount = data.reviews.filter((review) => Number(review.station) === Number(station.id)).length;

            return (
              <article className="entity-card station-card" key={station.id}>
                <div className="entity-card-top">
                  <StatusBadge value={station.status} />
                  {normalizedRole === "USER" && (
                    <button className={`favorite-button ${isFavorite ? "active" : ""}`} onClick={() => toggleFavorite(station)} type="button" aria-label="Toggle favourite">
                      {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  )}
                </div>
                <div className="entity-card-title"><p><FaMapMarkerAlt /> {station.city}, {station.state}</p><h2>{station.station_name}</h2><span>{station.address}</span></div>
                <div className="station-availability"><strong>{available}</strong><span>of {stationChargers.length} chargers available</span></div>
                <div className="entity-details-grid">
                  <div><span>Rating</span><strong><FaStar /> {station.rating} ({reviewCount})</strong></div>
                  <div><span>Hours</span><strong><FaClock /> {formatTime(station.opening_time)} – {formatTime(station.closing_time)}</strong></div>
                  <div><span>Phone</span><strong><FaPhone /> {station.contact_number}</strong></div>
                  <div><span>Amenities</span><strong>{station.amenities || "Basic facilities"}</strong></div>
                </div>
                <div className="card-actions">
                  {normalizedRole === "USER" && <button className="secondary-button" onClick={() => openReview(station)} type="button"><FaStar /> Review</button>}
                  {["ADMIN", "OPERATOR"].includes(normalizedRole) && <button className="secondary-button" onClick={() => openStationForm(station)} type="button"><FaEdit /> Edit</button>}
                  {["ADMIN", "OPERATOR"].includes(normalizedRole) && <button className="danger-button" onClick={() => deleteStation(station)} type="button"><FaTrash /></button>}
                </div>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="No stations match" message="Try another search term or status filter." />}

      {modal === "station" && (
        <Modal title={selectedStation ? "Edit station" : "Add charging station"} description="Accurate coordinates are used by station recommendations." onClose={() => setModal(null)} wide>
          <form className="form-grid" onSubmit={saveStation}>
            <Field label="Station name" full><input name="station_name" onChange={(e) => setStationForm({ ...stationForm, station_name: e.target.value })} required value={stationForm.station_name} /></Field>
            <Field label="Address" full><textarea name="address" onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })} required value={stationForm.address} /></Field>
            {[["city", "City"], ["state", "State"], ["pincode", "Pincode"], ["latitude", "Latitude"], ["longitude", "Longitude"], ["contact_number", "Contact number"], ["email", "Email"], ["opening_time", "Opening time"], ["closing_time", "Closing time"]].map(([name, label]) => (
              <Field key={name} label={label}><input name={name} onChange={(e) => setStationForm({ ...stationForm, [name]: e.target.value })} required type={name === "email" ? "email" : name.includes("time") ? "time" : "text"} value={stationForm[name]} /></Field>
            ))}
            <Field label="Status"><select onChange={(e) => setStationForm({ ...stationForm, status: e.target.value })} value={stationForm.status}><option>OPEN</option><option>CLOSED</option><option>MAINTENANCE</option></select></Field>
            <Field label="Amenities"><input onChange={(e) => setStationForm({ ...stationForm, amenities: e.target.value })} placeholder="Cafe, washroom, Wi-Fi" value={stationForm.amenities} /></Field>
            <FormActions loading={saving} onCancel={() => setModal(null)} submitLabel={selectedStation ? "Update station" : "Create station"} />
          </form>
        </Modal>
      )}

      {modal === "review" && (
        <Modal title={`Review ${selectedStation.station_name}`} description="Your rating updates the station's public score." onClose={() => setModal(null)}>
          <form className="form-grid" onSubmit={submitReview}>
            <Field label="Rating" full><select onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })} value={reviewForm.rating}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}</select></Field>
            <Field label="Comment" full><textarea onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your charging experience" value={reviewForm.comment} /></Field>
            <FormActions loading={saving} onCancel={() => setModal(null)} submitLabel="Submit review" />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default StationsPage;
