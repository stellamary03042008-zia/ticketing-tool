import { useState, useEffect } from 'react'
import './App.css'

const API_URL = `${import.meta.env.VITE_API_URL}/api/tickets`

function App() {
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Technical')
  const [priority, setPriority] = useState('Medium')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePage, setActivePage] = useState('Dashboard')
  const [supportName, setSupportName] = useState('Support Team')
  const [role, setRole] = useState('Administrator')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      setLoading(true)

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Unable to load tickets.')
      }

      const data = await response.json()
      setTickets(data)
      setError('')
    } catch (err) {
      setError('Could not connect to the backend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function createTicket(event) {
    event.preventDefault()

    if (!title.trim()) return

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          priority,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not create ticket.')
      }

      setTickets((current) => [...current, data])
      setTitle('')
      setCategory('Technical')
      setPriority('Medium')
      setShowForm(false)
      setError('')
      setSavedMessage('Ticket created successfully!')
    } catch (err) {
      setError(err.message || 'Could not create ticket.')
    }
  }

  async function updateStatus(id, status) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not update ticket.')
      }

      setTickets((current) =>
        current.map((ticket) => ticket.id === id ? data : ticket)
      )

      setError('')
      setSavedMessage('Ticket status updated!')
    } catch (err) {
      setError(err.message || 'Could not update ticket status.')
      fetchTickets()
    }
  }

  async function deleteTicket(id) {
    if (!window.confirm('Are you sure you want to delete this ticket?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete ticket.')
      }

      setTickets((current) =>
        current.filter((ticket) => ticket.id !== id)
      )

      setError('')
      setSavedMessage('Ticket deleted successfully!')
    } catch (err) {
      setError(err.message || 'Could not delete ticket.')
    }
  }

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase()) ||
    String(ticket.id).includes(search)
  )

  const openCount = tickets.filter(
    (ticket) => ticket.status === 'Open'
  ).length

  const progressCount = tickets.filter(
    (ticket) => ticket.status === 'In Progress'
  ).length

  const closedCount = tickets.filter(
    (ticket) => ticket.status === 'Closed'
  ).length

  function navigate(page) {
    setActivePage(page)
    setSearch('')
    setError('')
    setSavedMessage('')
  }

  function renderTicketsTable() {
    return (
      <section className="tickets-section">
        <div className="section-heading">
          <div>
            <h2>
              {activePage === 'Dashboard'
                ? 'Recent Tickets'
                : 'All Support Tickets'}
            </h2>
            <p>View and manage your support requests.</p>
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="Search tickets..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Loading tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                (activePage === 'Dashboard'
                  ? filteredTickets.slice(-5).reverse()
                  : filteredTickets
                ).map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <strong>{ticket.title}</strong>
                      <small>#{ticket.id}</small>
                    </td>

                    <td>{ticket.category}</td>

                    <td>
                      <span
                        className={`badge priority-${ticket.priority.toLowerCase()}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td>
                      <select
                        className="status-select"
                        value={ticket.status}
                        onChange={(event) =>
                          updateStatus(ticket.id, event.target.value)
                        }
                        aria-label={`Status for ${ticket.title}`}
                      >
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Closed</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="delete-button"
                        onClick={() => deleteTicket(ticket.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">
          TicketFlow<span>.</span>
        </h2>

        <p className="side-label">WORKSPACE</p>

        {['Dashboard', 'All Tickets', 'Settings'].map((page) => (
          <div
            key={page}
            className={`nav-item ${activePage === page ? 'active' : ''}`}
            onClick={() => navigate(page)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') navigate(page)
            }}
          >
            {page === 'Dashboard' && '▦'}
            {page === 'All Tickets' && '▤'}
            {page === 'Settings' && '⚙'}
            &nbsp; {page}
          </div>
        ))}

        <div className="sidebar-bottom">
          <div className="avatar">SM</div>
          <div>
            <strong>{supportName}</strong>
            <p>{role}</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace / {activePage}
            </p>

            <h1>
              {activePage === 'Dashboard' && 'Support Dashboard'}
              {activePage === 'All Tickets' && 'All Tickets'}
              {activePage === 'Settings' && 'Settings'}
            </h1>

            <p className="subtitle">
              {activePage === 'Dashboard' &&
                'Manage and track your support requests in one place.'}
              {activePage === 'All Tickets' &&
                'View, search, update, and delete your support tickets.'}
              {activePage === 'Settings' &&
                'Customize your support team profile.'}
            </p>
          </div>

          {activePage !== 'Settings' && (
            <button
              className="primary-button"
              onClick={() => setShowForm(!showForm)}
            >
              + Create Ticket
            </button>
          )}
        </header>

        {error && (
          <p role="alert" style={{ color: 'red', margin: '12px 0' }}>
            {error}
          </p>
        )}

        {savedMessage && (
          <p
            role="status"
            style={{ color: 'green', margin: '12px 0' }}
          >
            {savedMessage}
          </p>
        )}

        {activePage === 'Dashboard' && (
          <section className="stats-grid">
            <div className="stat-card">
              <p>Total Tickets</p>
              <h2>{tickets.length}</h2>
              <span>All support requests</span>
            </div>

            <div className="stat-card">
              <p>Open Tickets</p>
              <h2>{openCount}</h2>
              <span>Awaiting attention</span>
            </div>

            <div className="stat-card">
              <p>In Progress</p>
              <h2>{progressCount}</h2>
              <span>Currently being handled</span>
            </div>

            <div className="stat-card">
              <p>Resolved</p>
              <h2>{closedCount}</h2>
              <span>Closed tickets</span>
            </div>
          </section>
        )}

        {showForm && activePage !== 'Settings' && (
          <section className="form-card">
            <h2>Create a Support Ticket</h2>

            <form onSubmit={createTicket}>
              <label>
                Ticket Title
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Describe your issue"
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option>Technical</option>
                    <option>Account</option>
                    <option>Billing</option>
                    <option>General</option>
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>

              <button className="primary-button" type="submit">
                Submit Ticket
              </button>

              <button
                className="cancel-button"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </form>
          </section>
        )}

        {activePage === 'Dashboard' && renderTicketsTable()}

        {activePage === 'All Tickets' && renderTicketsTable()}

        {activePage === 'Settings' && (
          <section className="form-card">
            <h2>Profile Settings</h2>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                setSavedMessage(
                  'Profile updated for this session.'
                )
              }}
            >
              <label>
                Team Name
                <input
                  type="text"
                  value={supportName}
                  onChange={(event) => setSupportName(event.target.value)}
                  required
                />
              </label>

              <label>
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option>Administrator</option>
                  <option>Support Agent</option>
                  <option>Team Leader</option>
                </select>
              </label>

              <button className="primary-button" type="submit">
                Save Settings
              </button>

              <button
                className="cancel-button"
                type="button"
                onClick={fetchTickets}
              >
                Refresh Tickets
              </button>
            </form>

            <p style={{ marginTop: '20px' }}>
              <strong>Database:</strong> Connected through the backend API
            </p>

            <p>
              <strong>Total tickets:</strong> {tickets.length}
            </p>
          </section>
        )}

        <footer>
          TicketFlow Support System · Full Stack Development
        </footer>
      </main>
    </div>
  )
}

export default App