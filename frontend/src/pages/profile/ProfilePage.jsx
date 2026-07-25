import { useCallback, useState } from "react";
import { FaEdit, FaEnvelope, FaHome, FaMapMarkerAlt, FaPhone, FaShieldAlt, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

import { ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import authService from "../../services/authService";
import evService from "../../services/evService";
import { titleCase } from "../../utils/format";

const emptyProfileForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function ProfilePage() {
  const { updateUser } = useAuth();
  const loader = useCallback(() => evService.getProfile(), []);
  const { data, loading, error, refresh } = useResource(loader);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState(emptyProfileForm);
  const [saving, setSaving] = useState(false);

  const openEditModal = () => {
    setForm({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || "",
    });
    setEditModalOpen(true);
  };

  const change = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile(form);
      if (updateUser) {
        updateUser(updated);
      }
      toast.success("Profile updated successfully.");
      setEditModalOpen(false);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not update your profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading your profile..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
  const displayName = fullName || data.username;

  const details = [
    { icon: <FaUser />, label: "Full name", value: fullName },
    { icon: <FaEnvelope />, label: "Email", value: data.email },
    { icon: <FaPhone />, label: "Phone", value: data.phone },
    { icon: <FaMapMarkerAlt />, label: "City & state", value: [data.city, data.state].filter(Boolean).join(", ") },
    { icon: <FaHome />, label: "Address", value: [data.address, data.pincode].filter(Boolean).join(" · ") },
  ];

  const completed = details.filter((item) => item.value).length;
  const completeness = Math.round((completed / details.length) * 100);

  return (
    <section>
      <PageHeader
        eyebrow="Account settings"
        title="Profile"
        description="Manage your account details and contact information associated with EV-ChargeX."
        action={
          <button className="primary-button" onClick={openEditModal} type="button">
            <FaEdit /> Edit profile
          </button>
        }
      />

      <div className="profile-layout">
        <article className="profile-card">
          <div className="profile-avatar">
            {data.profile_image ? (
              <img src={data.profile_image} alt={displayName} />
            ) : (
              <FaUser />
            )}
          </div>
          <h2>{displayName}</h2>
          <p>@{data.username}</p>
          <StatusBadge value={data.is_verified ? "Verified" : "Pending verification"} />
          <div className="profile-role">
            <FaShieldAlt />
            <span>
              <small>Account role</small>
              <strong>{titleCase(data.role)}</strong>
            </span>
          </div>
        </article>

        <article className="dashboard-panel profile-details-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Personal details</p>
              <h2>Contact & address information</h2>
            </div>
            <span className="profile-completeness">{completeness}% complete</span>
          </div>
          <div className="profile-progress">
            <i style={{ width: `${completeness}%` }} />
          </div>
          <div className="profile-detail-grid">
            {details.map((item) => (
              <div key={item.label}>
                <span className="profile-detail-icon">{item.icon}</span>
                <span>
                  <small>{item.label}</small>
                  <strong>{item.value || "Not provided"}</strong>
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>

      {editModalOpen && (
        <Modal
          title="Edit profile"
          description="Update your contact details and home address."
          onClose={() => setEditModalOpen(false)}
        >
          <form className="form-grid" onSubmit={saveProfile}>
            <Field label="First name">
              <input name="first_name" onChange={change} value={form.first_name} />
            </Field>
            <Field label="Last name">
              <input name="last_name" onChange={change} value={form.last_name} />
            </Field>
            <Field label="Email" full>
              <input name="email" onChange={change} required type="email" value={form.email} />
            </Field>
            <Field label="Phone number" full>
              <input name="phone" onChange={change} placeholder="+91 9876543210" value={form.phone} />
            </Field>
            <Field label="Address" full>
              <textarea name="address" onChange={change} rows="2" value={form.address} />
            </Field>
            <Field label="City">
              <input name="city" onChange={change} value={form.city} />
            </Field>
            <Field label="State">
              <input name="state" onChange={change} value={form.state} />
            </Field>
            <Field label="Pincode">
              <input name="pincode" onChange={change} value={form.pincode} />
            </Field>
            <FormActions
              loading={saving}
              onCancel={() => setEditModalOpen(false)}
              submitLabel={saving ? "Saving..." : "Save profile"}
            />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default ProfilePage;
