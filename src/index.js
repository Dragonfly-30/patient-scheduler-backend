require('dotenv').config();

const express = require("express");
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const Auth = require('./routes/auth');
app.use('/api/users', Auth);

const appoit = require("./routes/appointmentsroute");
app.use('/api/appointments', appoit);

const Intake = require('./routes/intakeroute'); // <--- import intake routes
app.use('/api/intake', Intake);

console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not loaded');

connectDB();

app.get('/api', (req, res) => {
    res.send("Patient Scheduler API is running!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/api`);

});