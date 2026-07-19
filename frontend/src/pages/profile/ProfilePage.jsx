import { useCallback } from "react";
import { FaEnvelope, FaHome, FaMapMarkerAlt, FaPhone, FaShieldAlt, FaUser } from "react-icons/fa";

import { ErrorState, LoadingState, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService from "../../services/evService";
import { titleCase } from "../../utils/format";

function ProfilePage() {
  const loader = useCallback(() => evService.getProfile(), []);
  const { data, loading, error, refresh } = useResource(loader);

  if (loading) return <LoadingState label="Loading your profile..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const details = [
    { icon: <FaEnvelope />, label: "Email", value: data.email },
    { icon: <FaPhone />, label: "Phone", value: data.phone },
    { icon: <FaMapMarkerAlt />, label: "City & state", value: [data.city, data.state].filter(Boolean).join(", ") },
    { icon: <FaHome />, label: "Address", value: [data.address, data.pincode].filter(Boolean).join(" · ") },
  ];
  const completed = details.filter((item) => item.value).length;
  const completeness = Math.round((completed / details.length) * 100);

  return (
    <section>
      <PageHeader eyebrow="Account" title="Profile" description="Identity and contact information associated with your EV-ChargeX account." />
      <div className="profile-layout">
        <article className="profile-card">
          <div className="profile-avatar"><FaUser /></div>
          <h2>{data.username}</h2>
          <p>{data.email}</p>
          <StatusBadge value={data.is_verified ? "Verified" : "Pending"} />
          <div className="profile-role"><FaShieldAlt /><span><small>Account role</small><strong>{titleCase(data.role)}</strong></span></div>
        </article>
        <article className="dashboard-panel profile-details-panel">
          <div className="panel-heading"><div><p className="panel-label">Personal details</p><h2>Contact information</h2></div><span className="profile-completeness">{completeness}% complete</span></div>
          <div className="profile-progress"><i style={{ width: `${completeness}%` }} /></div>
          <div className="profile-detail-grid">
            {details.map((item) => <div key={item.label}><span className="profile-detail-icon">{item.icon}</span><span><small>{item.label}</small><strong>{item.value || "Not provided"}</strong></span></div>)}
          </div>
          <p className="profile-note">Profile editing is not exposed by the current Django API. These values can be updated after a profile update endpoint is added.</p>
        </article>
      </div>
    </section>
  );
}

export default ProfilePage;
