import { useCallback, useEffect, useState } from 'react'
import './App.css'

const emptyForm = { name: '', priority: 2, frequency: 5, completion_state: false }

function Clover() {
  return <svg className="clover" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12C8.3 10.1 7.2 6.7 8.8 4.4c1.4-2 4.1-.7 3.2 2.5.9-3.2 3.6-4.5 5-2.5 1.6 2.3.5 5.7-5 7.6Z" />
    <path d="M12 12c1.9-3.7 5.3-4.8 7.6-3.2 2 1.4.7 4.1-2.5 3.2 3.2.9 4.5 3.6 2.5 5-2.3 1.6-5.7.5-7.6-5Z" />
    <path d="M12 12c3.7 1.9 4.8 5.3 3.2 7.6-1.4 2-4.1.7-3.2-2.5-.9 3.2-3.6 4.5-5 2.5-1.6-2.3-.5-5.7 5-7.6Z" />
    <path d="M12 12c-1.9 3.7-5.3 4.8-7.6 3.2-2-1.4-.7-4.1 2.5-3.2-3.2-.9-4.5-3.6-2.5-5 2.3-1.6 5.7-.5 7.6 5Z" />
    <path d="M12 12c-.2 3.2 1.3 5.2 3.4 7.1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
}

function App() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadHabits = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/habits')
      if (!response.ok) throw new Error()
      const data = await response.json()
      setHabits(data.habits || [])
      setError('')
    } catch {
      setError('Could not connect to TinyHabit. Make sure the API is running, then try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadHabits() }, [loadHabits])

  const completed = habits.filter((habit) => habit.completion_state).length
  const progress = habits.length ? Math.round((completed / habits.length) * 100) : 0
  const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())

  async function saveHabit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(editing ? `/api/habits/${editing.id}` : '/api/habits', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, priority: Number(form.priority), frequency: Number(form.frequency) }),
      })
      if (!response.ok) throw new Error()
      setModalOpen(false)
      setForm(emptyForm)
      setEditing(null)
      await loadHabits()
    } catch {
      setError('Could not save your habit. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function editHabit(habit) {
    setEditing(habit)
    setForm({ name: habit.name, priority: habit.priority, frequency: habit.frequency, completion_state: habit.completion_state })
    setModalOpen(true)
  }

  async function deleteHabit(habit) {
    if (!window.confirm(`Delete “${habit.name}”? This can’t be undone.`)) return
    try {
      const response = await fetch(`/api/habits/${habit.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error()
      setHabits((current) => current.filter((item) => item.id !== habit.id))
      setError('')
    } catch {
      setError('Could not delete that habit. Please try again.')
    }
  }

  async function toggleHabit(habit) {
    const updated = { ...habit, completion_state: !habit.completion_state }
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!response.ok) throw new Error()
      setHabits((current) => current.map((item) => item.id === habit.id ? updated : item))
      setError('')
    } catch {
      setError('Could not update that habit. Please try again.')
    }
  }

  const priorityLabel = (priority) => ({ 1: 'HIGH', 2: 'MED', 3: 'LOW' })[priority] || `P${priority}`

  return (
    <main className="page-shell">
      <header className="app-header">
        <a href="#top" className="wordmark" aria-label="TinyHabit home"><Clover /><span>TinyHabit</span></a>
        <button className="add-button" onClick={() => { setEditing(null); setForm(emptyForm); setModalOpen(true) }}><span aria-hidden="true">+</span> Add</button>
      </header>

      <section className="day-summary" id="top">
        <p className="date-label">{dateLabel}</p>
        <h1>{completed} of {habits.length} habits</h1>
      </section>

      {error && <div className="error-message" role="alert"><span>{error}</span><button onClick={loadHabits}>Try again</button></div>}

      {loading ? <div className="loading-message">Loading your habits…</div> : habits.length ? <section className="habit-list" aria-label="Your habits">
        {habits.map((habit) => <article className={`habit-row ${habit.completion_state ? 'completed' : ''}`} key={habit.id}>
          <button className={`check-button ${habit.completion_state ? 'checked' : ''}`} onClick={() => toggleHabit(habit)} aria-label={habit.completion_state ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}>
            {habit.completion_state && <span aria-hidden="true">✓</span>}
          </button>
          <div className="habit-copy"><h2>{habit.name}</h2><p>{habit.frequency} {habit.frequency === 1 ? 'time' : 'times'} this week</p></div>
          <div className="habit-row-side"><span className={`priority-label priority-${habit.priority}`}>{priorityLabel(habit.priority)}</span><div className="row-actions"><button onClick={() => editHabit(habit)}>Edit</button><button onClick={() => deleteHabit(habit)}>Delete</button></div></div>
        </article>)}
      </section> : <section className="empty-state"><p>No habits yet.</p><button onClick={() => setModalOpen(true)}>Add your first habit</button></section>}

      {!loading && habits.length > 0 && <footer className="progress-summary"><strong>{progress}%</strong><span>weekly progress</span><div className="progress-track" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div></footer>}

      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}>
        <form className="habit-modal" onSubmit={saveHabit}>
          <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>Close</button>
          <h2>{editing ? 'Update habit' : 'Add a habit'}</h2>
          <label className="field-label" htmlFor="habit-name">Habit name</label>
          <input id="habit-name" className="form-input" autoFocus required maxLength={120} placeholder="e.g. Go for a walk" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <div className="form-row">
            <label className="form-field"><span className="field-label">Priority</span><select className="form-input" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="1">High</option><option value="2">Medium</option><option value="3">Low</option></select></label>
            <label className="form-field"><span className="field-label">Times this week</span><input className="form-input" type="number" min="1" max="7" required value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })} /></label>
          </div>
          <div className="modal-actions"><button className="cancel-button" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="add-button" type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add habit'}</button></div>
        </form>
      </div>}
    </main>
  )
}

export default App
