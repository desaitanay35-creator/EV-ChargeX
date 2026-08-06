import { useCallback, useState } from "react";
import {
  FaBan,
  FaChargingStation,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaIdCard,
  FaInfoCircle,
  FaLock,
  FaLockOpen,
  FaPlus,
  FaSearch,
  FaUserCheck,
  FaUserCog,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-toastify";

import {
  EmptyState,
  ErrorState,
  Field,
  FormActions,
  LoadingState,
  MetricCard,
  Modal,
  PageHeader,
  StatusBadge,
} from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatDate, titleCase } from "../../utils/format";

function AdminOperatorsPage() {
  const { user: currentUser } = useAuth();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assignmentFilter, setAssignmentFilter] = useState("ALL");
  const [ordering, setOrdering] = useState("newest");

  // Operators List Loader
  const loader = useCallback(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (assignmentFilter !== "ALL") params.assignment = assignmentFilter;
    if (ordering) params.ordering = ordering;
    return evService.admin.operators.list(params);
  }, [search, statusFilter, assignmentFilter, ordering]);

  const { data, loading, error, refresh } = useResource(loader);
  const operatorsList = toList(data);

  // Stations List Loader for Reassignment Modal
  const stationsLoader = useCallback(() => evService.stations.list(), []);
  const { data: stationsData, refresh: refreshStations } = useResource(stationsLoader);
  const allStations = toList(stationsData);

  // Users List Loader for User Conversion Selector
  const usersLoader = useCallback(() => evService.admin.users.list({ role: "USER" }), []);
  const { data: usersData, refresh: refreshUsers } = useResource(usersLoader);
  const userCandidates = toList(usersData);

  // Modal States
  const [detailOperator, setDetailOperator] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Reassignment Modal State
  const [reassignStationTarget, setReassignStationTarget] = useState(null);
  const [targetOperatorId, setTargetOperatorId] = useState("");
  const [reassigning, setReassigning] = useState(false);

  // User Conversion Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertUserId, setConvertUserId] = useState("");
  const [converting, setConverting] = useState(false);

  // Governance Blocking / Role Change State
  const [blockingTarget, setBlockingTarget] = useState(null);
  const [unblockingTarget, setUnblockingTarget] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Summary Metrics
  const summaryCounts = {
    total: operatorsList.length,
    active: operatorsList.filter((o) => o.is_active).length,
    blocked: operatorsList.filter((o) => !o.is_active).length,
    assigned: operatorsList.filter((o) => (o.assigned_stations_count || 0) > 0).length,
    unassigned: operatorsList.filter((o) => (o.assigned_stations_count || 0) === 0).length,
    totalManagedStations: operatorsList.reduce((acc, o) => acc + (o.assigned_stations_count || 0), 0),
  };

  const handleOpenDetail = async (op) => {
    try {
      setLoadingDetail(true);
      const detail = await evService.admin.operators.detail(op.id);
      setDetailOperator(detail);
    } catch (err) {
      toast.error(getApiError(err, "Could not fetch operator details."));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateOperator = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (createForm.password !== createForm.confirm_password) {
      setCreateError({ confirm_password: ["Passwords do not match."] });
      return;
    }

    setSubmittingCreate(true);
    try {
      await evService.admin.operators.create(createForm);
      toast.success(`Operator account @${createForm.username} created successfully!`);
      setShowCreateModal(false);
      setCreateForm({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
        first_name: "",
        last_name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
      refresh();
    } catch (err) {
      const parsedErr = getApiError(err);
      if (typeof parsedErr === "object") {
        setCreateError(parsedErr);
      } else {
        toast.error(parsedErr);
      }
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleReassignStation = async (e) => {
    e.preventDefault();
    if (!reassignStationTarget || !targetOperatorId || reassigning) return;

    setReassigning(true);
    try {
      const res = await evService.admin.stations.assignOperator(reassignStationTarget.id, targetOperatorId);
      toast.success(res.message || "Station operator reassigned successfully.");
      setReassignStationTarget(null);
      setTargetOperatorId("");
      refresh();
      refreshStations();
    } catch (err) {
      toast.error(getApiError(err, "Station reassignment failed."));
    } finally {
      setReassigning(false);
    }
  };

  const handleConvertUserToOperator = async (e) => {
    e.preventDefault();
    if (!convertUserId || converting) return;

    setConverting(true);
    try {
      const res = await evService.admin.users.changeRole(convertUserId, "OPERATOR");
      toast.success(res.message || "User account successfully converted to Station Operator.");
      setShowConvertModal(false);
      setConvertUserId("");
      refresh();
      refreshUsers();
    } catch (err) {
      toast.error(getApiError(err, "Failed to convert user account."));
    } finally {
      setConverting(false);
    }
  };

  const handleBlockOperator = async (e) => {
    e.preventDefault();
    if (!blockingTarget || submittingAction) return;

    if (blockingTarget.assigned_stations_count > 0) {
      toast.error("This operator manages assigned stations. Reassign all stations before blocking.");
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await evService.admin.users.block(blockingTarget.id);
      toast.success(res.message || `Operator @${blockingTarget.username} has been blocked.`);
      setBlockingTarget(null);
      refresh();
    } catch (err) {
      toast.error(getApiError(err, "Could not block operator account."));
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUnblockOperator = async (e) => {
    e.preventDefault();
    if (!unblockingTarget || submittingAction) return;

    setSubmittingAction(true);
    try {
      const res = await evService.admin.users.unblock(unblockingTarget.id);
      toast.success(res.message || `Operator @${unblockingTarget.username} has been unblocked.`);
      setUnblockingTarget(null);
      refresh();
    } catch (err) {
      toast.error(getApiError(err, "Could not unblock operator account."));
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading && !operatorsList.length) return <LoadingState label="Loading station operator accounts..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader
        eyebrow="Operator Governance"
        title="Station Operator Management"
        description="Create operator accounts, convert existing drivers to operators, manage station assignments, and enforce operational guards."
        actions={
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="secondary-button" onClick={() => setShowConvertModal(true)} type="button">
              <FaUserPlus /> Convert Existing User
            </button>
            <button className="primary-button" onClick={() => setShowCreateModal(true)} type="button">
              <FaPlus /> Create Operator Account
            </button>
          </div>
        }
      />

      {/* Summary Metrics */}
      <div className="dashboard-card-grid" style={{ marginBottom: "25px" }}>
        <MetricCard icon={<FaUserCog />} label="Total operators" value={summaryCounts.total} hint="Registered Station Operators" />
        <MetricCard icon={<FaUserCheck />} label="Active operators" value={summaryCounts.active} hint="Normal operational access" accent="green" />
        <MetricCard icon={<FaBan />} label="Blocked operators" value={summaryCounts.blocked} hint="Access deactivated" accent="orange" />
        <MetricCard icon={<FaChargingStation />} label="With stations" value={summaryCounts.assigned} hint={`${summaryCounts.unassigned} unassigned operators`} accent="blue" />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar" style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-box" style={{ flex: "1 1 250px", position: "relative" }}>
          <input
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search operator name, username, email, phone..."
            type="search"
            value={search}
          />
        </div>

        <select className="toolbar-select" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
          <option value="ALL">All Statuses</option>
          <option value="active">Active Operators</option>
          <option value="blocked">Blocked Operators</option>
        </select>

        <select className="toolbar-select" onChange={(e) => setAssignmentFilter(e.target.value)} value={assignmentFilter}>
          <option value="ALL">All Assignments</option>
          <option value="with_assigned">With Assigned Stations</option>
          <option value="without_assigned">Without Assigned Stations</option>
        </select>

        <select className="toolbar-select" onChange={(e) => setOrdering(e.target.value)} value={ordering}>
          <option value="newest">Newest Created</option>
          <option value="oldest">Oldest Created</option>
          <option value="username">Username A-Z</option>
          <option value="station_count">Station Count (High-Low)</option>
          <option value="last_login">Recent Login</option>
        </select>
      </div>

      {/* Operators List / Grid / Table */}
      {operatorsList.length ? (
        <article className="dashboard-panel table-panel">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Assigned Stations</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {operatorsList.map((op) => {
                  const assignedStations = op.assigned_stations || [];
                  const isAssigned = (op.assigned_stations_count || 0) > 0;

                  return (
                    <tr key={op.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong>@{op.username}</strong>
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                            {[op.first_name, op.last_name].filter(Boolean).join(" ") || "No name set"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "0.85rem" }}>
                          <span>{op.email}</span>
                          <span style={{ color: "#94a3b8" }}>{op.phone || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge value={op.is_active ? "Active" : "Blocked"} />
                      </td>
                      <td>
                        {isAssigned ? (
                          <div style={{ fontSize: "0.85rem" }}>
                            <strong>{op.assigned_stations_count} station(s)</strong>
                            <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                              {assignedStations.map((st) => st.station_name).join(", ")}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>
                            No stations assigned
                          </span>
                        )}
                      </td>
                      <td>{formatDate(op.date_joined)}</td>
                      <td>
                        <div className="card-actions" style={{ justifyContent: "flex-start", gap: "6px" }}>
                          <button className="icon-button" onClick={() => handleOpenDetail(op)} title="View Operator Details" type="button">
                            <FaIdCard />
                          </button>

                          {op.is_active ? (
                            <button
                              className="icon-button danger"
                              disabled={isAssigned}
                              onClick={() => setBlockingTarget(op)}
                              title={isAssigned ? "Reassign stations before blocking" : "Block Operator"}
                              type="button"
                            >
                              <FaBan />
                            </button>
                          ) : (
                            <button className="icon-button success" onClick={() => setUnblockingTarget(op)} title="Unblock Operator" type="button">
                              <FaLockOpen />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      ) : (
        <EmptyState
          title="No Station Operators found"
          message="No operator accounts match the active filter criteria or search query."
        />
      )}

      {/* Station List & Reassignment Quick Panel */}
      <div style={{ marginTop: "35px" }}>
        <PageHeader
          eyebrow="Infrastructure Assignment"
          title="Station Operator Assignment & Reassignment"
          description="View all system charging stations and transfer operational authority between active Station Operators."
        />

        <article className="dashboard-panel table-panel" style={{ marginTop: "15px" }}>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Station Name</th>
                  <th>Location</th>
                  <th>Current Operator</th>
                  <th>Status</th>
                  <th>Reassign Authority</th>
                </tr>
              </thead>
              <tbody>
                {allStations.map((st) => (
                  <tr key={st.id}>
                    <td><strong>{st.station_name}</strong></td>
                    <td>{st.city}, {st.state}</td>
                    <td>
                      {st.operator ? (
                        <span><strong>@{st.operator.username || `Operator #${st.operator}`}</strong></span>
                      ) : (
                        <span style={{ color: "#ef4444" }}>Unassigned</span>
                      )}
                    </td>
                    <td><StatusBadge value={st.status} /></td>
                    <td>
                      <button
                        className="secondary-button compact"
                        onClick={() => {
                          setReassignStationTarget(st);
                          setTargetOperatorId(st.operator?.id || "");
                        }}
                        type="button"
                      >
                        Reassign Operator
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      {/* Create Operator Account Modal */}
      {showCreateModal && (
        <Modal
          title="Create Station Operator Account"
          description="Register a new dedicated operator account. Initial password must be securely provided to the operator."
          onClose={() => {
            setShowCreateModal(false);
            setCreateError(null);
          }}
        >
          <form className="form-grid" onSubmit={handleCreateOperator}>
            <div className="location-status-banner warning" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p><FaInfoCircle /> Password Policy Note: Create an initial password and share it securely with the operator. Forced first-login password change is currently unavailable.</p>
            </div>

            {createError?.non_field_errors && (
              <div className="location-status-banner error" style={{ gridColumn: "span 2" }}>
                <p>{createError.non_field_errors.join(" ")}</p>
              </div>
            )}

            <Field label="Username *" full error={createError?.username?.[0]}>
              <input
                required
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                placeholder="e.g. op_tata_ahmedabad"
                type="text"
                value={createForm.username}
              />
            </Field>

            <Field label="Email Address *" error={createError?.email?.[0]}>
              <input
                required
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="operator@company.com"
                type="email"
                value={createForm.email}
              />
            </Field>

            <Field label="Phone Number *" error={createError?.phone?.[0]}>
              <input
                required
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="9876543210"
                type="tel"
                value={createForm.phone}
              />
            </Field>

            <Field label="Initial Password *" error={createError?.password?.[0]}>
              <input
                required
                minLength={8}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                type={showPassword ? "text" : "password"}
                value={createForm.password}
              />
            </Field>

            <Field label="Confirm Password *" error={createError?.confirm_password?.[0]}>
              <input
                required
                minLength={8}
                onChange={(e) => setCreateForm({ ...createForm, confirm_password: e.target.value })}
                type={showPassword ? "text" : "password"}
                value={createForm.confirm_password}
              />
            </Field>

            <div style={{ gridColumn: "span 2", margin: "-5px 0 10px 0" }}>
              <label style={{ fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <input onChange={(e) => setShowPassword(e.target.checked)} type="checkbox" checked={showPassword} />
                Show Passwords
              </label>
            </div>

            <Field label="First Name" error={createError?.first_name?.[0]}>
              <input
                onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                placeholder="First name"
                type="text"
                value={createForm.first_name}
              />
            </Field>

            <Field label="Last Name" error={createError?.last_name?.[0]}>
              <input
                onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                placeholder="Last name"
                type="text"
                value={createForm.last_name}
              />
            </Field>

            <Field label="City" error={createError?.city?.[0]}>
              <input
                onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                placeholder="Ahmedabad"
                type="text"
                value={createForm.city}
              />
            </Field>

            <Field label="State" error={createError?.state?.[0]}>
              <input
                onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                placeholder="Gujarat"
                type="text"
                value={createForm.state}
              />
            </Field>

            <FormActions
              loading={submittingCreate}
              onCancel={() => setShowCreateModal(false)}
              submitLabel={submittingCreate ? "Creating..." : "Create Operator Account"}
            />
          </form>
        </Modal>
      )}

      {/* Convert Existing User Modal */}
      {showConvertModal && (
        <Modal
          title="Convert Existing Driver (USER) to Operator"
          description="Select an active EV driver account to grant Station Operator privileges."
          onClose={() => setShowConvertModal(false)}
        >
          <form className="form-grid" onSubmit={handleConvertUserToOperator}>
            <div className="dashboard-panel" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p>Converting a user account upgrades their role to <strong>OPERATOR</strong>. Their historical bookings and profile remain preserved.</p>
            </div>

            <Field label="Select User Account *" full>
              <select onChange={(e) => setConvertUserId(e.target.value)} value={convertUserId} required>
                <option value="">-- Choose active EV Driver --</option>
                {userCandidates.map((u) => (
                  <option key={u.id} value={u.id}>
                    @{u.username} ({u.email}) - {[u.first_name, u.last_name].filter(Boolean).join(" ")}
                  </option>
                ))}
              </select>
            </Field>

            <FormActions
              loading={converting}
              onCancel={() => setShowConvertModal(false)}
              submitLabel={converting ? "Converting..." : "Convert Account to OPERATOR"}
            />
          </form>
        </Modal>
      )}

      {/* Station Reassignment Modal */}
      {reassignStationTarget && (
        <Modal
          title={`Reassign Station Operator: ${reassignStationTarget.station_name}`}
          description="Transfer operational responsibility for this station to a target active Station Operator."
          onClose={() => setReassignStationTarget(null)}
        >
          <form className="form-grid" onSubmit={handleReassignStation}>
            <div className="dashboard-panel" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p>Station: <strong>{reassignStationTarget.station_name}</strong> ({reassignStationTarget.city})</p>
              <p>Current Operator: <strong>@{reassignStationTarget.operator?.username || "Unassigned"}</strong></p>
              <div className="location-status-banner warning" style={{ marginTop: "10px" }}>
                <p><FaExclamationTriangle /> Operational authority changes immediately upon reassignment. Active charging sessions must be completed or interrupted before transfer.</p>
              </div>
            </div>

            <Field label="Select Target Active Operator *" full>
              <select onChange={(e) => setTargetOperatorId(e.target.value)} value={targetOperatorId} required>
                <option value="">-- Select Active Station Operator --</option>
                {operatorsList
                  .filter((op) => op.is_active)
                  .map((op) => (
                    <option key={op.id} value={op.id}>
                      @{op.username} ({op.email}) - {op.assigned_stations_count} station(s)
                    </option>
                  ))}
              </select>
            </Field>

            <FormActions
              loading={reassigning}
              onCancel={() => setReassignStationTarget(null)}
              submitLabel={reassigning ? "Reassigning..." : "Confirm Reassignment"}
            />
          </form>
        </Modal>
      )}

      {/* Block Operator Modal */}
      {blockingTarget && (
        <Modal
          title={`Block Operator Account: @${blockingTarget.username}`}
          description="Deactivate operator access."
          onClose={() => setBlockingTarget(null)}
        >
          <form className="form-grid" onSubmit={handleBlockOperator}>
            <div className="location-status-banner error" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p><FaExclamationTriangle /> Warning: Blocking @{blockingTarget.username} will reject future operator login attempts.</p>
            </div>

            {blockingTarget.assigned_stations_count > 0 && (
              <div className="location-status-banner error" style={{ gridColumn: "span 2" }}>
                <p>This operator manages {blockingTarget.assigned_stations_count} station(s). Reassign stations first.</p>
              </div>
            )}

            <FormActions
              loading={submittingAction}
              onCancel={() => setBlockingTarget(null)}
              submitLabel={submittingAction ? "Blocking..." : "Confirm Block Operator"}
            />
          </form>
        </Modal>
      )}

      {/* Unblock Operator Modal */}
      {unblockingTarget && (
        <Modal
          title={`Unblock Operator Account: @${unblockingTarget.username}`}
          description="Restore operator access."
          onClose={() => setUnblockingTarget(null)}
        >
          <form className="form-grid" onSubmit={handleUnblockOperator}>
            <div className="dashboard-panel" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p>Re-activating account @{unblockingTarget.username} will restore normal access to EV-ChargeX.</p>
            </div>

            <FormActions
              loading={submittingAction}
              onCancel={() => setUnblockingTarget(null)}
              submitLabel={submittingAction ? "Unblocking..." : "Confirm Unblock Operator"}
            />
          </form>
        </Modal>
      )}

      {/* Operator Detail Modal */}
      {detailOperator && (
        <Modal
          title={`Operator Details: @${detailOperator.username}`}
          description="Comprehensive operational summary."
          onClose={() => setDetailOperator(null)}
        >
          <div className="form-grid">
            <div className="dashboard-panel" style={{ gridColumn: "span 2" }}>
              <p className="panel-label">Profile Information</p>
              <p>Full name: <strong>{[detailOperator.first_name, detailOperator.last_name].filter(Boolean).join(" ") || "—"}</strong></p>
              <p>Email: <strong>{detailOperator.email}</strong></p>
              <p>Phone: <strong>{detailOperator.phone || "—"}</strong></p>
              <p>Status: <strong>{detailOperator.is_active ? "Active" : "Blocked"}</strong></p>
              <p>Member since: <strong>{formatDate(detailOperator.date_joined)}</strong></p>
            </div>

            <div className="dashboard-panel" style={{ gridColumn: "span 2" }}>
              <p className="panel-label">Operational Infrastructure Summary</p>
              <p>Assigned stations: <strong>{detailOperator.assigned_stations_count}</strong></p>
              <p>Total chargers: <strong>{detailOperator.total_chargers_count}</strong></p>
              <p>Active charging sessions: <strong>{detailOperator.total_active_sessions_count}</strong></p>
              <p>Today's bookings: <strong>{detailOperator.today_bookings_count}</strong></p>
            </div>

            <div className="dashboard-panel" style={{ gridColumn: "span 2" }}>
              <p className="panel-label">Assigned Station List</p>
              {detailOperator.assigned_stations.length ? (
                <ul>
                  {detailOperator.assigned_stations.map((st) => (
                    <li key={st.id}>
                      <strong>{st.station_name}</strong> ({st.city}) — {st.chargers_count} chargers, {st.active_sessions_count} active sessions
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No station is currently assigned to this operator.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default AdminOperatorsPage;
