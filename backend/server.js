const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
    res.send('Support Ticketing Tool API is running!');
});

// Get all tickets from MySQL
app.get('/api/tickets', async (req, res) => {
    try {
        const [tickets] = await db.execute(
            'SELECT * FROM tickets ORDER BY id DESC'
        );

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        res.status(500).json({ message: 'Failed to fetch tickets.' });
    }
});

// Create a ticket in MySQL
app.post('/api/tickets', async (req, res) => {
    try {
        const { title, category, priority } = req.body;

        if (typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                message: 'Ticket title is required.'
            });
        }

        const newTicket = {
            id: Date.now(),
            title: title.trim(),
            category: category || 'General',
            priority: priority || 'Medium',
            status: 'Open'
        };

        await db.execute(
            `INSERT INTO tickets (id, title, category, priority, status)
             VALUES (?, ?, ?, ?, ?)`,
            [
                newTicket.id,
                newTicket.title,
                newTicket.category,
                newTicket.priority,
                newTicket.status
            ]
        );

        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error.message);
        res.status(500).json({ message: 'Failed to create ticket.' });
    }
});

// Update ticket status in MySQL
app.patch('/api/tickets/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;
        const allowedStatuses = ['Open', 'In Progress', 'Closed'];

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({ message: 'Invalid ticket ID.' });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid ticket status.' });
        }

        const [result] = await db.execute(
            'UPDATE tickets SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            const [rows] = await db.execute(
                'SELECT id FROM tickets WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Ticket not found.' });
            }
        }

        const [rows] = await db.execute(
            'SELECT * FROM tickets WHERE id = ?',
            [id]
        );

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating ticket:', error.message);
        res.status(500).json({ message: 'Failed to update ticket.' });
    }
});

// Delete a ticket from MySQL
app.delete('/api/tickets/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({ message: 'Invalid ticket ID.' });
        }

        const [result] = await db.execute(
            'DELETE FROM tickets WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }

        res.json({ message: 'Ticket deleted successfully.' });
    } catch (error) {
        console.error('Error deleting ticket:', error.message);
        res.status(500).json({ message: 'Failed to delete ticket.' });
    }
});

// Start server
// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
