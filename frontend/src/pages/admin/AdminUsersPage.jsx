import { useCallback, useState } from "react";
import { FaBan, FaCheckCircle, FaExclamationTriangle, FaFilter, FaIdCard, FaLockOpen, FaSearch, FaShieldAlt, FaUserCheck, FaUserCog, FaUserShield, FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, MetricCard, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatDate, titleCase } from "../../utils/format";

function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ordering, setOrdering] = useState("newest");

  // API Resource Loader
  const loader = useCallback(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (roleFilter !== "ALL") params.role = roleFilter;
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (ordering) params.ordering = ordering;
    return evService.admin.users.list(params);
  }, [search, roleFilter, statusFilter, ordering]);

  const { data, loading, error, refresh } = useResource(loader);
  const usersList = toList(data);

  // Detail Modal State
  const [detailUser, setDetailUser] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Governance Action Modal States
  const [blockingTarget, setBlockingTarget] = useState(null);
  const [unblockingTarget, setUnblockingTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [newRoleVal, setNewRoleVal] = useState("OPERATOR");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Compute Summary Counters from current view / overall list
  const summaryCounts = {
    total: usersList.length,
    active: usersList.filter((u) => u.is_active).length,
    blocked: usersList.filter((u) => !u.is_active).length,
    operators: usersList.filter((u) => u.role === "OPERATOR").length,
    users: usersList.filter((u) => u.role === "USER").length,
  };

  const handleOpenDetail = async (u) => {
    try {
      setLoadingDetail(true);
      const detail = await evService.admin.users.detail(u.id);
      setDetailUser(detail);
    } catch (err) {
      toast.error(getApiError(err, "Could not fetch user detail."));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBlockUser = async (e) => {
    e.preventDefault();
    if (!blockingTarget || submittingAction) return;
    setSubmittingAction(true);
    try {
      const res = await evService.admin.users.block(blockingTarget.id);
      toast.success(res.message || `User ${blockingTarget.username} has been blocked.`);
      setBlockingTarget(null);
      refresh();
    } catch (err) {
      toast.error(getApiError(err, "Could not block user account."));
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUnblockUser = async (e) => {
    e.preventDefault();
    if (!unblockingTarget || submittingAction) return;
    setSubmittingAction(true);
    try {
      const res = await evService.admin.users.unblock(unblockingTarget.id);
      toast.success(res.message || `User ${unblockingTarget.username} has been unblocked.`);
      setUnblockingTarget(null);
      refresh();
    } catch (err) {
      toast.error(getApiError(err, "Could not unblock user account."));
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleChangeRole = async (e) => {
    e.preventDefault();
    if (!roleTarget || submittingAction) return;

    if (roleTarget.role === "OPERATOR" && newRoleVal === "USER" && roleTarget.assigned_stations_count > 0) {
      toast.error("This operator manages assigned stations. Reassign those stations before converting to USER.");
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await evService.admin.users.changeRole(roleTarget.id, newRoleVal);
      toast.success(res.message || `User role updated to ${newRoleVal}.`);
      setRoleTarget(null);
      refresh();
    } catch (err) {
      toast.error(getApiError(err, "Could not update user role."));
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading && !usersList.length) return <LoadingState label="Loading application accounts..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader
        eyebrow="Account Governance"
        title="User & Role Management"
        description="Oversee application user accounts, manage Station Operator roles, block suspicious accounts, and inspect operational metrics."
      />

      {/* Summary Cards */}
      <div className="dashboard-card-grid" style={{ marginBottom: "25px" }}>
        <MetricCard icon={<FaUsers />} label="Total accounts" value={summaryCounts.total} hint="Registered platform users" />
        <MetricCard icon={<FaUserCheck />} label="Active accounts" value={summaryCounts.active} hint="Normal active access" accent="green" />
        <MetricCard icon={<FaBan />} label="Blocked accounts" value={summaryCounts.blocked} hint="Access de-activated" accent="orange" />
        <MetricCard icon={<FaUserCog />} label="Station operators" value={summaryCounts.operators} hint={`${summaryCounts.users} EV drivers`} accent="blue" />
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar" style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-box" style={{ flex: "1 1 250px", position: "relative" }}>
          <input
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username, name, email, phone..."
            type="search"
            value={search}
          />
        </div>

        <select className="toolbar-select" onChange={(e) => setRoleFilter(e.target.value)} value={roleFilter}>
          <option value="ALL">All Roles</option>
          <option value="USER">Driver (USER)</option>
          <option value="OPERATOR">Station Operator</option>
          <option value="ADMIN">Administrator</option>
        </select>

        <select className="toolbar-select" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
          <option value="ALL">All Statuses</option>
          <option value="active">Active Accounts</option>
          <option value="inactive">Blocked Accounts</option>
        </select>

        <select className="toolbar-select" onChange={(e) => setOrdering(e.target.value)} value={ordering}>
          <option value="newest">Newest Joined</option>
          <option value="oldest">Oldest Joined</option>
          <option value="username">Username A-Z</option>
          <option value="last_login">Recent Login</option>
        </select>
      </div>

      {/* Accounts Table */}
      {usersList.length ? (
        <article className="dashboard-panel table-panel">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact info</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Metrics</th>
                  <th>Governance actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => {
                  const isCurrentAdmin = currentUser && Number(currentUser.id) === Number(u.id);

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong>@{u.username} {isCurrentAdmin && <span className="unread-badge" style={{ fontSize: "0.7rem", padding: "1px 5px" }}>You</span>}</strong>
                          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{[u.first_name, u.last_name].filter(Boolean).join(" ") || "No name set"}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "0.85rem" }}>
                          <span>{u.email}</span>
                          <span style={{ color: "#94a3b8" }}>{u.phone || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role?.toLowerCase()}`}>
                          {titleCase(u.role)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge value={u.is_active ? "Active" : "Blocked"} />
                      </td>
                      <td>{formatDate(u.date_joined)}</td>
                      <td>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          {u.role === "OPERATOR" ? (
                            <span><strong>{u.assigned_stations_count}</strong> station(s)</span>
                          ) : (
                            <span><strong>{u.vehicles_count}</strong> vehicles · <strong>{u.bookings_count}</strong> bookings</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="card-actions" style={{ justifyContent: "flex-start", gap: "6px" }}>
                          <button className="icon-button" onClick={() => handleOpenDetail(u)} title="View User Detail" type="button">
                            <FaIdCard />
                          </button>

                          {!isCurrentAdmin && u.role !== "ADMIN" && (
                            <>
                              {u.is_active ? (
                                <button className="icon-button danger" onClick={() => setBlockingTarget(u)} title="Block User Account" type="button">
                                  <FaBan />
                                </button>
                              ) : (
                                <button className="icon-button success" onClick={() => setUnblockingTarget(u)} title="Unblock Account" type="button">
                                  <FaLockOpen />
                                </button>
                              )}

                              {u.role === "USER" && (
                                <button
                                  className="secondary-button compact"
                                  onClick={() => { setRoleTarget(u); setNewRoleVal("OPERATOR"); }}
                                  type="button"
                                >
                                  Make Operator
                                </button>
                              )}

                              {u.role === "OPERATOR" && (
                                <button
                                  className="secondary-button compact"
                                  onClick={() => { setRoleTarget(u); setNewRoleVal("USER"); }}
                                  type="button"
                                >
                                  Make User
                                </button>
                              )}
                            </>
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
          title="No accounts match filter criteria"
          message="Adjust search parameters or status filters to locate specific user accounts."
        />
      )}

      {/* User Detail Modal */}
      {detailUser && (
        <Modal
          title={`Account Detail: @${detailUser.username}`}
          description="Detailed profile and infrastructure summary."
          onClose={() => setDetailUser(null)}
        >
          <div className="form-grid">
            <div className="dashboard-panel" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p className="panel-label">Profile information</p>
              <p>Full name: <strong>{[detailUser.first_name, detailUser.last_name].filter(Boolean).join(" ") || "—"}</strong></p>
              <p>Email: <strong>{detailUser.email}</strong></p>
              <p>Phone: <strong>{detailUser.phone || "—"}</strong></p>
              <p>Role: <strong>{detailUser.role}</strong> · Status: <strong>{detailUser.is_active ? "Active" : "Blocked"}</strong></p>
              <p>Location: <strong>{[detailUser.address, detailUser.city, detailUser.state, detailUser.pincode].filter(Boolean).join(", ") || "—"}</strong></p>
              <p>Member since: <strong>{formatDate(detailUser.date_joined)}</strong></p>
            </div>

            {detailUser.role === "OPERATOR" && (
              <div className="dashboard-panel" style={{ gridColumn: "span 2" }}>
                <p className="panel-label">Assigned stations ({detailUser.assigned_stations.length})</p>
                {detailUser.assigned_stations.length ? (
                  <ul>
                    {detailUser.assigned_stations.map((st) => (
                      <li key={st.id}><strong>{st.station_name}</strong> ({st.city})</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No station is currently assigned to this operator.</p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Block User Confirmation Modal */}
      {blockingTarget && (
        <Modal
          title={`Block Account: @${blockingTarget.username}`}
          description="De-activate access for this account."
          onClose={() => setBlockingTarget(null)}
        >
          <form className="form-grid" onSubmit={handleBlockUser}>
            <div className="location-status-banner error" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p><FaExclamationTriangle /> Warning: Blocking this user will immediately reject future authentication attempts for @{blockingTarget.username}. Operational history (bookings, trips, payments) will remain preserved.</p>
            </div>

            {blockingTarget.role === "OPERATOR" && blockingTarget.assigned_stations_count > 0 && (
              <div className="location-status-banner error" style={{ gridColumn: "span 2" }}>
                <p>This operator currently manages {blockingTarget.assigned_stations_count} assigned station(s). Reassign stations before blocking.</p>
              </div>
            )}

            <FormActions
              loading={submittingAction}
              onCancel={() => setBlockingTarget(null)}
              submitLabel={submittingAction ? "Blocking..." : "Confirm block account"}
            />
          </form>
        </Modal>
      )}

      {/* Unblock User Confirmation Modal */}
      {unblockingTarget && (
        <Modal
          title={`Unblock Account: @${unblockingTarget.username}`}
          description="Re-activate login access for this account."
          onClose={() => setUnblockingTarget(null)}
        >
          <form className="form-grid" onSubmit={handleUnblockUser}>
            <div className="dashboard-panel" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p>Re-activating account @{unblockingTarget.username} will restore normal access to EV-ChargeX.</p>
            </div>

            <FormActions
              loading={submittingAction}
              onCancel={() => setUnblockingTarget(null)}
              submitLabel={submittingAction ? "Unblocking..." : "Confirm unblock account"}
            />
          </form>
        </Modal>
      )}

      {/* Role Conversion Modal */}
      {roleTarget && (
        <Modal
          title={`Change Role: @${roleTarget.username}`}
          description={`Convert user role from ${roleTarget.role} to ${newRoleVal}.`}
          onClose={() => setRoleTarget(null)}
        >
          <form className="form-grid" onSubmit={handleChangeRole}>
            <div className="dashboard-panel" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p>Current role: <strong>{roleTarget.role}</strong></p>
              {newRoleVal === "OPERATOR" && (
                <p style={{ color: "#38bdf8", marginTop: "5px" }}>
                  This user will receive Station Operator privileges. You can assign a charging station from Station Management.
                </p>
              )}
              {newRoleVal === "USER" && roleTarget.assigned_stations_count > 0 && (
                <div className="location-status-banner error" style={{ marginTop: "10px" }}>
                  <p>Cannot convert: This operator manages {roleTarget.assigned_stations_count} station(s). Reassign stations first.</p>
                </div>
              )}
            </div>

            <Field label="Target application role" full>
              <select onChange={(e) => setNewRoleVal(e.target.value)} value={newRoleVal}>
                <option value="OPERATOR">Station Operator (OPERATOR)</option>
                <option value="USER">Normal EV Driver (USER)</option>
              </select>
            </Field>

            <FormActions
              loading={submittingAction}
              onCancel={() => setRoleTarget(null)}
              submitLabel={submittingAction ? "Converting..." : `Confirm change to ${newRoleVal}`}
            />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default AdminUsersPage;
