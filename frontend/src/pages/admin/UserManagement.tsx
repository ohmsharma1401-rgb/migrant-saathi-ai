import { useState } from 'react'
import { Users, Plus, Search, Edit2, X, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'worker' | 'official' | 'inspector' | 'admin'

interface DemoUser {
  id: string
  name: string
  credential: string   // email or mobile
  role: Role
  active: boolean
  joined: string
}

// ─── Demo dataset ─────────────────────────────────────────────────────────────
const INITIAL_USERS: DemoUser[] = [
  { id: 'U001', name: 'Raj Mehta',        credential: 'official@gujarat.gov.in',  role: 'official',  active: true,  joined: '2024-01-15' },
  { id: 'U002', name: 'Priya Sharma',     credential: 'inspector@gujarat.gov.in', role: 'inspector', active: true,  joined: '2024-02-20' },
  { id: 'U003', name: 'System Admin',     credential: 'admin@saathi.ai',          role: 'admin',     active: true,  joined: '2024-01-01' },
  { id: 'U004', name: 'Ramesh Kumar',     credential: '9876543210',               role: 'worker',    active: true,  joined: '2024-03-05' },
  { id: 'U005', name: 'Ankit Patel',      credential: 'ankit.official@guj.gov.in',role: 'official',  active: false, joined: '2024-03-10' },
  { id: 'U006', name: 'Sunita Devi',      credential: '9812345678',               role: 'worker',    active: true,  joined: '2024-04-02' },
  { id: 'U007', name: 'Rahul Verma',      credential: '9898001122',               role: 'worker',    active: true,  joined: '2024-04-18' },
  { id: 'U008', name: 'Kavita Inspector', credential: 'kavita.insp@labour.gov.in',role: 'inspector', active: false, joined: '2024-05-01' },
]

const STATS = [
  { label: 'Total Users',  value: '12,851' },
  { label: 'Workers',      value: '12,847' },
  { label: 'Officials',    value: '3' },
  { label: 'Inspectors',   value: '1' },
  { label: 'Admins',       value: '1' },
]

// ─── Role badge styling ───────────────────────────────────────────────────────
const ROLE_STYLE: Record<Role, string> = {
  worker:    'bg-blue-100 text-blue-800',
  official:  'bg-purple-100 text-purple-800',
  inspector: 'bg-amber-100 text-amber-800',
  admin:     'bg-red-100 text-red-800',
}

const ROLE_LABEL: Record<Role, string> = {
  worker: 'Worker', official: 'Govt Official', inspector: 'Labour Inspector', admin: 'System Admin',
}

// ─── Add User Modal ───────────────────────────────────────────────────────────
interface AddUserForm { name: string; credential: string; role: Role; password: string }

const EMPTY_FORM: AddUserForm = { name: '', credential: '', role: 'official', password: '' }

function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (u: DemoUser) => void }) {
  const [form, setForm] = useState<AddUserForm>(EMPTY_FORM)
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!form.name.trim())       { setError('Name is required.'); return }
    if (!form.credential.trim()) { setError('Email or mobile is required.'); return }
    if (!form.password.trim())   { setError('Password is required.'); return }
    const newUser: DemoUser = {
      id: `U${Date.now()}`,
      name: form.name,
      credential: form.credential,
      role: form.role,
      active: true,
      joined: new Date().toISOString().slice(0, 10),
    }
    onAdd(newUser)
    onClose()
  }

  const inputCls = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Add New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Raj Mehta" />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Email / Mobile</Label>
            <Input value={form.credential} onChange={(e) => setForm((f) => ({ ...f, credential: e.target.value }))} placeholder="user@example.com or 98XXXXXXXX" />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Role</Label>
            <div className="relative">
              <select
                className={inputCls + ' appearance-none pr-8'}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              >
                <option value="worker">Worker</option>
                <option value="official">Govt Official</option>
                <option value="inspector">Labour Inspector</option>
                <option value="admin">System Admin</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Set initial password" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add User</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit User Modal ─────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSave }: { user: DemoUser; onClose: () => void; onSave: (u: DemoUser) => void }) {
  const [form, setForm] = useState({ name: user.name, role: user.role as Role })

  const inputCls = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Email / Mobile (read-only)</Label>
            <Input value={user.credential} readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Role</Label>
            <div className="relative">
              <select
                className={inputCls + ' appearance-none pr-8'}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              >
                <option value="worker">Worker</option>
                <option value="official">Govt Official</option>
                <option value="inspector">Labour Inspector</option>
                <option value="admin">System Admin</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ ...user, name: form.name, role: form.role })}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function UserManagement() {
  const [users, setUsers] = useState<DemoUser[]>(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editUser, setEditUser] = useState<DemoUser | null>(null)

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.credential.toLowerCase().includes(search.toLowerCase()) ||
      u.role.includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  function toggleActive(id: string) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: !u.active } : u))
  }

  function handleAdd(u: DemoUser) {
    setUsers((prev) => [u, ...prev])
  }

  function handleSave(updated: DemoUser) {
    setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u))
    setEditUser(null)
  }

  const inputCls = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage user accounts and roles across the platform</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATS.map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Search + filter ─────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative w-44">
          <select
            className={inputCls + ' appearance-none pr-8'}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
          >
            <option value="all">All Roles</option>
            <option value="worker">Worker</option>
            <option value="official">Official</option>
            <option value="inspector">Inspector</option>
            <option value="admin">Admin</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Email / Mobile</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLE[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.credential}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.active ? 'success' : 'outline'}>
                        {u.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{u.joined}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditUser(u)}
                          title="Edit user"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <button
                          onClick={() => toggleActive(u.id)}
                          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                            u.active
                              ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Modals ──────────────────────────────────────────── */}
      {showAdd && (
        <AddUserModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSave} />
      )}
    </div>
  )
}
