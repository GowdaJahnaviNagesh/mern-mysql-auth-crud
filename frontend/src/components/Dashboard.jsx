// frontend/src/components/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getItems, createItem, updateItem, deleteItem, getStats,
} from '../api/itemApi'

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const classes = {
    active:    'badge-active',
    pending:   'badge-pending',
    completed: 'badge-completed',
  }
  return <span className={classes[status] || 'badge'}>{status}</span>
}

const StatCard = ({ label, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  </div>
)

const ConfirmDialog = ({ item, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="card max-w-sm w-full shadow-2xl shadow-black/60 page-enter">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-900/60 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold">Delete Item</h3>
          <p className="text-slate-400 text-sm">This action cannot be undone</p>
        </div>
      </div>
      <p className="text-slate-300 text-sm mb-6">
        Are you sure you want to delete <span className="text-white font-medium">"{item?.title}"</span>?
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading} className="btn-secondary flex-1">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1 flex items-center justify-center gap-2">
          {loading ? <><span className="spinner" /> Deleting…</> : 'Delete'}
        </button>
      </div>
    </div>
  </div>
)

const ItemForm = ({ editItem, onSubmit, onCancel, loading, error }) => {
  const [form, setForm] = useState({
    title:       editItem?.title       || '',
    description: editItem?.description || '',
    status:      editItem?.status      || 'active',
  })

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert-error text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text" name="title" value={form.title} onChange={handleChange}
          placeholder="Item title" className="input-field" required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
        <textarea
          name="description" value={form.description} onChange={handleChange}
          placeholder="Optional description…" rows={3}
          className="input-field resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
        <select name="status" value={form.status} onChange={handleChange} className="input-field">
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading
            ? <><span className="spinner" /> {editItem ? 'Saving…' : 'Adding…'}</>
            : editItem ? 'Save Changes' : 'Add Item'
          }
        </button>
      </div>
    </form>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user, logout } = useAuth()

  const [items,       setItems]       = useState([])
  const [stats,       setStats]       = useState({ total: 0, active: 0, pending: 0, completed: 0 })
  const [loadingData, setLoadingData] = useState(true)
  const [fetchError,  setFetchError]  = useState('')

  // Form state
  const [showForm,     setShowForm]     = useState(false)
  const [editingItem,  setEditingItem]  = useState(null)
  const [formLoading,  setFormLoading]  = useState(false)
  const [formError,    setFormError]    = useState('')
  const [formSuccess,  setFormSuccess]  = useState('')

  // Delete state
  const [deletingItem,  setDeletingItem]  = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Status update loading per item
  const [statusLoading, setStatusLoading] = useState({})

  // ── Fetch data ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingData(true)
    setFetchError('')
    try {
      const [itemsRes, statsRes] = await Promise.all([getItems(), getStats()])
      setItems(itemsRes.data.items)
      setStats(statsRes.data.stats)
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Auto-clear success messages
  useEffect(() => {
    if (!formSuccess) return
    const t = setTimeout(() => setFormSuccess(''), 3500)
    return () => clearTimeout(t)
  }, [formSuccess])

  // ── Create / Update ─────────────────────────────────────────
  const handleFormSubmit = async (formData) => {
    if (!formData.title.trim()) { setFormError('Title is required'); return }
    setFormError('')
    setFormLoading(true)
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData)
        setFormSuccess('Item updated successfully')
      } else {
        await createItem(formData)
        setFormSuccess('Item created successfully')
      }
      setShowForm(false)
      setEditingItem(null)
      fetchAll()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingItem) return
    setDeleteLoading(true)
    try {
      await deleteItem(deletingItem.id)
      setFormSuccess('Item deleted successfully')
      setDeletingItem(null)
      fetchAll()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Delete failed')
      setDeletingItem(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Quick Status Update ──────────────────────────────────────
  const handleStatusChange = async (item, newStatus) => {
    if (newStatus === item.status) return
    setStatusLoading((p) => ({ ...p, [item.id]: true }))
    try {
      await updateItem(item.id, { status: newStatus })
      fetchAll()
    } catch {
      // silent fail — could show a toast here
    } finally {
      setStatusLoading((p) => ({ ...p, [item.id]: false }))
    }
  }

  // ── Open edit ───────────────────────────────────────────────
  const openEdit = (item) => {
    setEditingItem(item)
    setFormError('')
    setShowForm(true)
  }

  const openAdd = () => {
    setEditingItem(null)
    setFormError('')
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormError('')
  }

  // ── Format date ─────────────────────────────────────────────
  const fmt = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-800 rounded-full flex items-center justify-center text-sm font-bold text-indigo-200">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-slate-300 font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Your Items
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">Manage and track all your tasks</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Item
          </button>
        </div>

        {/* Global success message */}
        {formSuccess && (
          <div className="alert-success flex items-center gap-2 mb-6">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {formSuccess}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Items" value={stats.total}
            color="bg-slate-800"
            icon={<svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard
            label="Active" value={stats.active}
            color="bg-emerald-900/50"
            icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
          <StatCard
            label="Pending" value={stats.pending}
            color="bg-amber-900/50"
            icon={<svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Completed" value={stats.completed}
            color="bg-blue-900/50"
            icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Inline Add/Edit Form */}
        {showForm && (
          <div className="card mb-6 border-indigo-800/50 shadow-lg shadow-indigo-900/10 page-enter">
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            <ItemForm
              editItem={editingItem}
              onSubmit={handleFormSubmit}
              onCancel={cancelForm}
              loading={formLoading}
              error={formError}
            />
          </div>
        )}

        {/* Items List */}
        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p className="text-slate-500 text-sm">Loading items…</p>
            </div>
          </div>
        ) : fetchError ? (
          <div className="alert-error">{fetchError}</div>
        ) : items.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">No items yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first item to get started</p>
            <button onClick={openAdd} className="btn-primary">
              Create First Item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="card flex flex-col sm:flex-row sm:items-center gap-4 hover:border-slate-700 transition-colors"
              >
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{item.title}</h4>
                      {item.description && (
                        <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-slate-600 text-xs mt-1.5">Created {fmt(item.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Status select + Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Quick status dropdown */}
                  <div className="relative">
                    {statusLoading[item.id] ? (
                      <div className="px-3 py-1.5"><span className="spinner" /></div>
                    ) : (
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item, e.target.value)}
                        className="text-xs rounded-lg px-2.5 py-1.5 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500
                          bg-slate-800 border-slate-700 text-slate-300 transition-colors hover:border-slate-600"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </div>

                  <StatusBadge status={item.status} />

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <ConfirmDialog
          item={deletingItem}
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}

export default Dashboard
