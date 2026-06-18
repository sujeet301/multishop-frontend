import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/helpers";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...(search && { search }), ...(role && { role }), limit: 50 });
      const res = await api.get(`/admin/users?${q}`);
      setUsers(res.data.data || []);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, role]);

  const toggleBlock = async (id, blocked) => {
    try {
      await api.put(`/admin/users/${id}/toggle-block`);
      toast.success(`User ${blocked ? "unblocked" : "blocked"}`);
      load();
    } catch { toast.error("Failed"); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try { await api.delete(`/admin/users/${id}`); toast.success("User deleted."); load(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-6">User Management 👥</h1>
      <div className="flex flex-wrap gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." className="input max-w-xs text-sm py-2" />
        <select value={role} onChange={e => setRole(e.target.value)} className="input w-auto text-sm py-2">
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_,i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>{["User","Email","Role","Joined","Status","Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-muted)] uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                    className="border-t border-[var(--border)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img src={u.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=32&background=6366f1&color=fff`}
                          alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium text-[var(--text)]">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">{u.email}</td>
                    <td className="py-3 px-4"><span className={`badge capitalize ${u.role==="admin"?"bg-purple-100 text-purple-700":u.role==="seller"?"bg-blue-100 text-blue-700":"bg-gray-100 text-gray-600"}`}>{u.role}</span></td>
                    <td className="py-3 px-4 text-xs text-[var(--text-muted)]">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4"><span className={`badge ${u.isBlocked?"badge-danger":"badge-success"}`}>{u.isBlocked?"Blocked":"Active"}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleBlock(u._id, u.isBlocked)}
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${u.isBlocked?"bg-green-100 text-green-700 hover:bg-green-200":"bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                        {u.role !== "admin" && (
                          <button onClick={() => deleteUser(u._id)} className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-medium">Delete</button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {!users.length && <tr><td colSpan={6} className="py-10 text-center text-[var(--text-muted)]">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
