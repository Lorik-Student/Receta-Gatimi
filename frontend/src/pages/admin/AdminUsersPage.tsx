import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import { readArrayPayload } from "../../lib/apiPayload";

type UserRole = "user" | "chef" | "admin";

interface UserRecord {
  id: number;
  emri: string;
  mbiemri: string;
  email: string;
  phone_number?: string | null;
  roles?: UserRole[];
  email_confirmed?: boolean;
  lockout_enabled?: boolean;
  access_failed_count?: number;
  data_krijimit?: string;
  statusi?: string;
}

type UserDraft = {
  emri: string;
  mbiemri: string;
  email: string;
  phone_number: string;
  password: string;
  roles: UserRole[];
  email_confirmed: boolean;
  lockout_enabled: boolean;
  access_failed_count: number;
  statusi: string;
};

const roleOptions: UserRole[] = ["user", "chef", "admin"];

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function toDraft(user: Partial<UserRecord>): UserDraft {
  return {
    emri: user.emri ?? "",
    mbiemri: user.mbiemri ?? "",
    email: user.email ?? "",
    phone_number: user.phone_number ?? "",
    password: "",
    roles: user.roles?.length ? user.roles : ["user"],
    email_confirmed: Boolean(user.email_confirmed),
    lockout_enabled: Boolean(user.lockout_enabled),
    access_failed_count: user.access_failed_count ?? 0,
    statusi: user.statusi ?? "active",
  };
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [draft, setDraft] = useState<UserDraft>(toDraft({}));
  const [draftError, setDraftError] = useState("");

  async function loadUsers() {
    setLoading(true);
    try {
      const response = await apiFetch("/users");
      setUsers(readArrayPayload<UserRecord>(response, ["users", "data"]));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      const fullName = `${user.emri ?? ""} ${user.mbiemri ?? ""}`.toLowerCase();
      const roleText = (user.roles ?? []).join(" ").toLowerCase();
      return fullName.includes(term) || (user.email ?? "").toLowerCase().includes(term) || roleText.includes(term) || (user.statusi ?? "").toLowerCase().includes(term);
    });
  }, [search, users]);

  function openCreate() {
    setSelectedUser(null);
    setDraft(toDraft({}));
    setDraftError("");
    setEditorOpen(true);
  }

  function openEdit(user: UserRecord) {
    setSelectedUser(user);
    setDraft(toDraft(user));
    setDraftError("");
    setEditorOpen(true);
  }

  async function saveUser() {
    try {
      const payload = {
        emri: draft.emri.trim(),
        mbiemri: draft.mbiemri.trim(),
        email: draft.email.trim(),
        phone_number: draft.phone_number.trim() || undefined,
        roles: draft.roles.length ? draft.roles : ["user"],
        email_confirmed: draft.email_confirmed,
        lockout_enabled: draft.lockout_enabled,
        access_failed_count: Number(draft.access_failed_count) || 0,
        statusi: draft.statusi.trim() || "active",
        ...(draft.password.trim() ? { password: draft.password } : {}),
      };

      if (!selectedUser && !draft.password.trim()) {
        setDraftError("Password is required for new users.");
        return;
      }

      const response = selectedUser
        ? await apiFetch(`/users/${selectedUser.id}`, { method: "PATCH", body: JSON.stringify(payload) })
        : await apiFetch("/users", { method: "POST", body: JSON.stringify(payload) });

      if (!response.ok) {
        throw new Error("Failed to save user");
      }

      setEditorOpen(false);
      await loadUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      setDraftError("Unable to save user.");
    }
  }

  async function deleteUser(user: UserRecord) {
    if (!window.confirm(`Delete ${user.emri} ${user.mbiemri}?`)) return;
    try {
      await apiFetch(`/users/${user.id}`, { method: "DELETE" });
      await loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>User Management</h2>
          <p className="mt-2 text-base" style={{ color: "var(--color-on-surface-variant)" }}>Create, edit, and delete platform accounts from one table.</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }} onClick={openCreate}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Add New User
        </button>
      </section>

      <div className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
        <div className="flex items-center justify-between gap-4 border-b p-5" style={{ borderBottomColor: "var(--color-outline-variant)" }}>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-on-surface-variant)", fontSize: 20 }}>search</span>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none"
              style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button type="button" className="hidden rounded-xl px-4 py-2 text-sm font-semibold md:inline-flex" style={{ color: "var(--color-primary)" }} onClick={loadUsers}>Refresh</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead style={{ backgroundColor: "var(--color-surface-container-low)" }}>
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Roles</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Joined</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: "var(--color-outline-variant)" }}>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-black/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold" style={{ backgroundColor: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                          {(user.emri?.slice(0, 1) ?? "U").toUpperCase()}{(user.mbiemri?.slice(0, 1) ?? "").toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>{user.emri} {user.mbiemri}</p>
                          <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{(user.roles ?? []).join(", ") || "user"}</td>
                    <td className="px-6 py-4"><span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: user.statusi === "inactive" ? "var(--color-error-container)" : "var(--color-secondary-container)", color: user.statusi === "inactive" ? "var(--color-on-error-container)" : "var(--color-on-secondary-container)" }}>{user.statusi ?? "active"}</span></td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{formatDate(user.data_krijimit)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }} onClick={() => openEdit(user)}>Edit</button>
                        <button type="button" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--color-error)" }} onClick={() => deleteUser(user)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>{selectedUser ? "Edit User" : "Create User"}</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Update the user payload and save it directly to the API.</p>
              </div>
              <button type="button" className="rounded-full px-3 py-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }} onClick={() => setEditorOpen(false)}>Close</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>First name<input className="rounded-xl border px-4 py-2.5 outline-none" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }} value={draft.emri} onChange={(event) => setDraft((current) => ({ ...current, emri: event.target.value }))} /></label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Last name<input className="rounded-xl border px-4 py-2.5 outline-none" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }} value={draft.mbiemri} onChange={(event) => setDraft((current) => ({ ...current, mbiemri: event.target.value }))} /></label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Email<input className="rounded-xl border px-4 py-2.5 outline-none" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }} value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} /></label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Phone<input className="rounded-xl border px-4 py-2.5 outline-none" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }} value={draft.phone_number} onChange={(event) => setDraft((current) => ({ ...current, phone_number: event.target.value }))} /></label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Password {selectedUser ? "(leave empty to keep current)" : ""}<input type="password" className="rounded-xl border px-4 py-2.5 outline-none" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }} value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} /></label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Status<input className="rounded-xl border px-4 py-2.5 outline-none" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }} value={draft.statusi} onChange={(event) => setDraft((current) => ({ ...current, statusi: event.target.value }))} /></label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}><input type="checkbox" checked={draft.email_confirmed} onChange={(event) => setDraft((current) => ({ ...current, email_confirmed: event.target.checked }))} /> Email confirmed</label>
              <label className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}><input type="checkbox" checked={draft.lockout_enabled} onChange={(event) => setDraft((current) => ({ ...current, lockout_enabled: event.target.checked }))} /> Lockout enabled</label>
              <label className="flex flex-col gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Failed logins<input type="number" min={0} className="rounded-xl border px-4 py-2.5 outline-none" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }} value={draft.access_failed_count} onChange={(event) => setDraft((current) => ({ ...current, access_failed_count: Number(event.target.value) }))} /></label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {roleOptions.map((role) => (
                <button key={role} type="button" className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-90" style={{ backgroundColor: draft.roles.includes(role) ? "var(--color-primary)" : "var(--color-surface-container-low)", color: draft.roles.includes(role) ? "var(--color-on-primary)" : "var(--color-on-surface-variant)" }} onClick={() => setDraft((current) => ({ ...current, roles: current.roles.includes(role) ? current.roles.filter((value) => value !== role) : [...current.roles, role] }))}>{role}</button>
              ))}
            </div>

            <p className="mt-5 text-sm font-medium" style={{ color: "var(--color-error)" }}>{draftError}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ color: "var(--color-on-surface-variant)" }} onClick={() => setEditorOpen(false)}>Cancel</button>
              <button type="button" className="rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }} onClick={saveUser}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
