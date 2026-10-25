import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/tickets'

function App() {
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Technical')
  const [priority, setPriority] = useState('Medium')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get tickets from the backend when the page loads
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
      setError('Could not connect to the backend. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  // Create a ticket through the backend
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

      setTickets((currentTickets) => [...currentTickets, data])
      setTitle('')
      setCategory('Technical')
      setPriority('Medium')
      setShowForm(false)
      setError('')
    } catch (err) {
      setError(err.message || 'Could not create ticket.')
    }
  }

  // Update ticket status through the backend
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

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === id ? data : ticket
        )
      )
      setError('')
    } catch (err) {
      setError(err.message || 'Could not update ticket status.')
      fetchTickets()
    }
  }

  // Delete a ticket through the backend
  async function deleteTicket(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete ticket.')
      }

      setTickets((currentTickets) =>
        currentTickets.filter((ticket) => ticket.id !== id)
      )
      setError('')
    } catch (err) {
      setError(err.message || 'Could not delete ticket.')
    }
  }

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">TicketFlow<span>.</span></h2>
        <p className="side-label">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">▤ &nbsp; All Tickets</div>
        <div className="nav-item">⚙ &nbsp; Settings</div>

        <div className="sidebar-bottom">
          <div className="avatar">SM</div>
          <div>
            <strong>Support Team</strong>
            <p>Administrator</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Support Dashboard</h1>
            <p className="subtitle">
              Manage and track your support requests in one place.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + Create Ticket
          </button>
        </header>

        {error && (
          <p role="alert" style={{ color: 'red', margin: '12px 0' }}>
            {error}
          </p>
        )}

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

        {showForm && (
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

        <section className="tickets-section">
          <div className="section-heading">
            <div>
              <h2>Recent Tickets</h2>
              <p>View and manage incoming support requests.</p>
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
                ) : filteredTickets.map((ticket) => (
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
                ))}

                {!loading && filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer>
          TicketFlow Support System · Full Stack Development
        </footer>
      </main>
    </div>
  )
}

export default App

