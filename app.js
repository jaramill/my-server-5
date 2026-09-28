const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { emitWarning } = require('process');

const app = express();
const port = process.env.PORT || 3000;


// Middleware to parse JSON bodies
app.use(express.json());

// Expose the bootstrap-icons folder to a public URL path
app.use('/icons', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')));


// Initialize SQLite Database (Using ':memory:' for demo, use 'users.db' to persist data)
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the in-memory SQLite database.');
        initializeDatabase();
    }
});

// Create table and insert seed data
function initializeDatabase() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                initials TEXT NOT NULL UNIQUE,
                avatar_color TEXT
            );
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS csvs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                csv_name TEXT NOT NULL,
                csv_month TEXT NOT NULL UNIQUE,
                csv_data BLOB NOT NULL,
                date_modified TEXT DEFAULT CURRENT_TIMESTAMP    
            );
        `);
        db.run(`
           CREATE TABLE IF NOT EXISTS occupancy (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                Room_1 TEXT,
                Room_2 TEXT,
                Room_3 TEXT,
                Room_4 TEXT,
                Room_5 TEXT,
                Room_6 TEXT,
                Room_7 TEXT,
                Room_8 TEXT,
                Room_9 TEXT,
                Room_10 TEXT,
                Room_11 TEXT,
                Room_12 TEXT,
                Room_13 TEXT,
                Room_14 TEXT,
                Room_16 TEXT,
                Room_17 TEXT,
                Room_18 TEXT,
                Room_19 TEXT,
                Room_20 TEXT,
                Room_21 TEXT,
                Room_22 TEXT,
                Room_23 TEXT,
                Room_24 TEXT,
                Room_25 TEXT,
                Room_26 TEXT,
                Room_28 TEXT,
                Room_29 TEXT,
                Room_30 TEXT,
                Room_31 TEXT,
                Room_32 TEXT,
                Room_33 TEXT,
                Room_34 TEXT,
                Room_35 TEXT,
                Room_36 TEXT,
                Room_27 TEXT
            );
        `);
        db.run(`
           CREATE TABLE IF NOT EXISTS cleaning (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                Room_1 TEXT,
                Room_2 TEXT,
                Room_3 TEXT,
                Room_4 TEXT,
                Room_5 TEXT,
                Room_6 TEXT,
                Room_7 TEXT,
                Room_8 TEXT,
                Room_9 TEXT,
                Room_10 TEXT,
                Room_11 TEXT,
                Room_12 TEXT,
                Room_13 TEXT,
                Room_14 TEXT,
                Room_16 TEXT,
                Room_17 TEXT,
                Room_18 TEXT,
                Room_19 TEXT,
                Room_20 TEXT,
                Room_21 TEXT,
                Room_22 TEXT,
                Room_23 TEXT,
                Room_24 TEXT,
                Room_25 TEXT,
                Room_26 TEXT,
                Room_28 TEXT,
                Room_29 TEXT,
                Room_30 TEXT,
                Room_31 TEXT,
                Room_32 TEXT,
                Room_33 TEXT,
                Room_34 TEXT,
                Room_35 TEXT,
                Room_36 TEXT,
                Room_27 TEXT
            );
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS occupancy_states (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cbr_id TEXT NOT NULL,
                state TEXT NOT NULL UNIQUE,
                abbreviation TEXT,
                priority INTEGER,  
                description TEXT,
                background_color TEXT,
                border TEXT,
                border_color TEXT,
                stripes TEXT,
                stripes_color TEXT,
                icon TEXT,
                deletable TEXT
            );
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS cleaning_states (
                id INTEGER PRIMARY KEY AUTOINCREMENT,          
                state TEXT NOT NULL UNIQUE,
                abbreviation TEXT,
                description TEXT,
                priority INTEGER, 
                background_color TEXT,
                border TEXT,
                border_color TEXT,
                stripes TEXT,
                icon TEXT,
                stripes_color
                
            );
        `);

        let stmt = db.prepare("INSERT INTO users (name, initials, avatar_color) VALUES (?, ?, ?)");
        stmt.run("Admin", "AD", "#6c757d");
        stmt.run("Alice Smith", "AS", "#4682B4");
        stmt.run("Bob Smith", "BS", "#FF00FF");
        stmt.finalize();

        stmt = db.prepare("INSERT INTO occupancy_states (cbr_id, priority, description, state, abbreviation, background_color, deletable) VALUES (?, ?, ?, ?, ?, ?, ?)");
        stmt.run("XY", 1, "Turnover day; at least one booking is departing and another booking is arriving", "Turnover", "TURNOVER", "#8c68cd", "false");
        stmt.run("XX", 2, "Accommodation booked; last booking(s) departing that day; accommodation will be empty afterwards", "Checking Out", "CHECKOUT", "#3d8bfd", "false");
        stmt.run("X", 3, "Accommodation booked; at least one booking is staying at least one more night", "Occupied", "OCC", "#a3cfbb", "false");
        stmt.run("-", 4, "Accommodation is unoccupied", "Vacant", "VAC", "#ffffff", "false");
        stmt.run("n/a", 5, "Under Maintenance", "Maintenance", "MAINT", "#adb5bd", "true")

        stmt = db.prepare("INSERT INTO cleaning_states (description, priority, state, abbreviation, background_color) VALUES (?, ?, ?, ?, ?)");
        
        stmt.run("Uncleaned", 1, "Uncleaned", "UNCLEANED", "#ffcd39");
        stmt.run("Cleaned", 2, "Cleaned", "CLEANED", "#479f76");
        stmt.run("No state", 3, "No State", "NO STATE", "#00000000");

        stmt.finalize();
        console.log('Database initialized with seed data.');
    });
}

//to test spinner
// app.use((req, res, next) => {
//   setTimeout(next, 1000);
// });

// API Routes

// For users

// Get all users
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Create a new user
app.post('/api/users', (req, res) => {
    const { name, initials, avatar_color } = req.body;

    if (!initials) {
        res.status(400).json({ error: "Initials are required" });
        return;
    }

    const sql = "INSERT INTO users (name, initials, avatar_color) VALUES (?, ?, ?) RETURNING *";
    db.get(sql, [name, initials, avatar_color], function (err, newEntry) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(201).json(newEntry);
    });
});
// Delete a user
app.delete('/api/users/update/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM users WHERE id = ?', id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Deleted successfully', changes: this.changes });
    });
});

// Update a user
app.put('/api/users/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, initials, avatar_color } = req.body;
    const sql = `UPDATE users SET name = ?, initials = ?, avatar_color = ? WHERE id = ? RETURNING *`;

    db.get(sql, [name, initials, avatar_color, id], function (err, newEntry) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json(newEntry);
    });
});

// For csvs

// Get all csvs
app.get('/api/csvs', (req, res) => {
    db.all("SELECT id, csv_name, csv_month, date_modified FROM csvs", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
// Get one csv
app.get('/api/csvs/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT csv_name, csv_month, date_modified, csv_data FROM csvs WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// Get the month of one csv
app.get('/api/csvs/month/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT csv_month FROM csvs WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// Check if the csv for a certain month exists, return the id if found
app.get('/api/csvs/check/:csvMonth', (req, res) => {
    const { csvMonth } = req.params;

    const sql = `SELECT id FROM csvs WHERE csv_month = ?`
    db.get(sql, [csvMonth], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            // Entry found
            res.json({ exists: true, data: row });
        } else {
            // Entry not found
            res.json({ exists: false, data: null });
        }
    });
});

// 2. Upload csv
app.post('/api/csvs', (req, res) => {
    const { csvName, csvMonth, csvString } = req.body;

    if (!csvName && !csvMonth && !csvString) {
        res.status(400).json({ error: "missing data" });
        return;
    }
    const sql = "INSERT OR REPLACE INTO csvs (csv_name, csv_month, csv_data) VALUES (?, ?, ?) RETURNING id, csv_name, csv_month, date_modified";
    db.get(sql, [csvName, csvMonth, csvString], function (err, newEntry) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(201).json(newEntry);
    });

});

// Delete a csv
app.delete('/api/csvs/update/:id', (req, res) => {
    const { id } = req.params;


    db.run('DELETE FROM csvs WHERE id = ?', id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Deleted successfully', changes: this.changes });
    });
});

// For occupancy (upload)

// delete occupancy for an entire month
app.delete('/api/occupancy/batch/:csvMonth', (req, res) => {
    const { csvMonth } = req.params;
    const parts = csvMonth.split('-');
    const dateStringArray = getDatesInMonth(parseInt(parts[1]), parseInt(parts[0]));

    for (const dateObj of dateStringArray) {
        const dateString = dateToDateString(dateObj);
        db.run('DELETE FROM occupancy WHERE id = ?', dateString, function (err) {
            if (err) return res.status(500).json({ error: err.message });
        });

    };
    res.status(200).json({ message: 'Deleted successfully', changes: this.changes });

});

// functions

function dateToDateString(date) {
    return date.toLocaleDateString('en-US', {
        //weekday: 'short', 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
function getDatesInMonth(year, month) {
    // Passing 0 as the day returns the last day of the prior month, 
    // effectively giving us the total number of days for the target month.
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let day = 1; day <= daysInMonth; day++) {
        dates.push(new Date(year, month, day));
    }

    return dates;
}

// Fill in occupancy table with parsed csv
app.post('/api/occupancy/batch', (req, res) => {
    try {
        //const dataObject = req.body; // e.g., { name: "Bob", age: 25, email: "bob@example.com" }
        const { roomOccupancyByDate } = req.body;
        
        // Extract columns and values for the first date

        // Destructure the first [key, value] pair from Object.entries()
        const [[firstDate, firstOccupancyByRoom]] = Object.entries(roomOccupancyByDate);

        const rooms = Object.keys(firstOccupancyByRoom);

        const roomsWithQuotes = rooms.map(item => `'${item}'`).join(', ');
        // Generate positional placeholders: "?, ?, ?"
        const placeholders = rooms.map(() => '?').join(', ');

        // Construct the SQL safely (Columns are dynamically injected, values are parameterized)
        const sql = `INSERT OR REPLACE INTO occupancy (date, ${roomsWithQuotes}) VALUES (?, ${placeholders})`;
        const stmt = db.prepare(sql);
        
        let hasError = false;

        Object.entries(roomOccupancyByDate).forEach(([date, occupancyByRoom]) => {
 
            // Prepare and execute with the array of values 
            let occupancyValues = Object.values(occupancyByRoom);
        
            stmt.run([date, ...occupancyValues], (err) => {
                if (err) {
                    hasError = true;
                    console.error('Row insertion error:', err.message);
                }
            });

        });
        stmt.finalize();
       if (hasError) {
        res.status(404).json({ error: 'Row insertion error' });
    }
        res.status(201).json({ message: 'occupancy data successfully imported!' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/occupancy/batch', (req, res) => {
    try {
        //const dataObject = req.body; // e.g., { name: "Bob", age: 25, email: "bob@example.com" }
        const { roomOccupancyByDate } = req.body;
        
        // Extract columns and values for the first date

        // Destructure the first [key, value] pair from Object.entries()
        const [[firstDate, firstOccupancyByRoom]] = Object.entries(roomOccupancyByDate);

        const rooms = Object.keys(firstOccupancyByRoom);

        const roomsWithQuotes = rooms.map(item => `'${item}'`).join(', ');
        // Generate positional placeholders: "?, ?, ?"
        const placeholders = rooms.map(() => '?').join(', ');

        // Construct the SQL safely (Columns are dynamically injected, values are parameterized)
        const sql = `INSERT OR REPLACE INTO occupancy (date, ${roomsWithQuotes}) VALUES (?, ${placeholders})`;
        const stmt = db.prepare(sql);
        
        let hasError = false;

        Object.entries(roomOccupancyByDate).forEach(([date, occupancyByRoom]) => {
 
            // Prepare and execute with the array of values 
            let occupancyValues = Object.values(occupancyByRoom);
        
            stmt.run([date, ...occupancyValues], (err) => {
                if (err) {
                    hasError = true;
                    console.error('Row insertion error:', err.message);
                }
            });

        });
        stmt.finalize();
       if (hasError) {
        res.status(404).json({ error: 'Row insertion error' });
    }
        res.status(201).json({ message: 'occupancy data successfully imported!' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//For daily occupancy and cleaning updates

app.post('/api/cleaning', (req, res) => {

    const { currentDateString, roomId, cleaningStateId} = req.body;
    
const sql = `INSERT into cleaning (date, ${roomId}) VALUES ('${currentDateString}', ${cleaningStateId}) ON CONFLICT (date) DO UPDATE SET ${roomId}=excluded.${roomId} RETURNING ${roomId}`;
    db.get(sql, function (err, newEntry) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        } if (this.changes === 0) {
            return res.status(404).json({ message: "date not found" });
        }
        res.status(201).json(newEntry);
    });
});






// For states

// Get occupancy states
app.get('/api/occupancy-states', (req, res) => {
    db.all("SELECT * FROM occupancy_states", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
// Get cbr_id and state id from occupancy states
app.get('/api/occupancy-states-by-cbr-id', (req, res) => {
    db.all("SELECT cbr_id, id, state FROM occupancy_states", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Post occupancy state
app.post('/api/occupancy-states', (req, res) => {

    const { cbr_id, state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color, deletable } = req.body;
    const sql = "INSERT INTO occupancy_states (cbr_id, state, abbreviation, priority, description,  background_color, border, border_color, stripes, stripes_color, deletable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *";
    db.get(sql, [cbr_id, state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color, deletable], function (err, newEntry) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(201).json(newEntry);
    });
});

// Update occupancy state
app.put('/api/occupancy-states/update/:id', (req, res) => {
    const { id } = req.params;
    const { cbr_id, state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color } = req.body;
    const sql = "UPDATE occupancy_states SET cbr_id = ?, state = ?, abbreviation = ?, priority = ?, description = ?,  background_color = ?, border = ?, border_color = ?, stripes = ?, stripes_color = ? WHERE id = ? RETURNING *";

    db.get(sql, [cbr_id, state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color, id], function (err, newEntry) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(newEntry);
    });
});

// Delete occupancy state
app.delete('/api/occupancy-states/update/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM occupancy_states WHERE id = ?', id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Deleted successfully', changes: this.changes });
    });
});

// Get cleaning states
app.get('/api/cleaning-states', (req, res) => {
    db.all("SELECT * FROM cleaning_states", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Post cleaning state
app.post('/api/cleaning-states', (req, res) => {

    const { state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color } = req.body;
    const sql = "INSERT INTO cleaning_states (state, abbreviation, priority, description,  background_color, border, border_color, stripes, stripes_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *";
    db.get(sql, [state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color], function (err, newEntry) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(201).json(newEntry);
    });
});

// Update cleaning state
app.put('/api/cleaning-states/update/:id', (req, res) => {
    const { id } = req.params;
    const { state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color } = req.body;
    const sql = "UPDATE cleaning_states SET state = ?, abbreviation = ?, priority = ?, description = ?,  background_color = ?, border = ?, border_color = ?, stripes = ?, stripes_color = ? WHERE id = ? RETURNING *";

    db.get(sql, [state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color, id], function (err, newEntry) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(newEntry);
    });
});

// Delete cleaning state
app.delete('/api/cleaning-states/update/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM cleaning_states WHERE id = ?', id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Deleted successfully', changes: this.changes });
    });
});

// Get occupancy by date string
app.get('/api/occupancy/:dateString', (req, res) => {
    const { dateString } = req.params;
    db.get("SELECT * FROM occupancy WHERE date = ?", [dateString], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            // Entry found
            res.json({ exists: true, data: row });
        } else {
            // Entry not found
            res.json({ exists: false, data: null });
        }
    });
});

// Get cleaning by date string
app.get('/api/cleaning/:dateString', (req, res) => {
    const { dateString } = req.params;
    db.get("SELECT * FROM cleaning WHERE date = ?", [dateString], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            // Entry found
            res.json({ exists: true, data: row });
        } else {
            // Entry not found
            res.json({ exists: false, data: null });
        }
    });
});

app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
