const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const fs = require('fs');
const bodyParser = require('body-parser');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const AdminModel = require('./models/adminModel');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'hi-jane',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Custom middleware for setting Content-Type for JavaScript files
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// View engine setup with Mustache
app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

// Routes
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'HTML', 'index.html');
    res.sendFile(indexPath);
});

app.get('/events', (req, res) => {
    const eventsPath = path.join(__dirname, 'public', 'HTML', 'events.html');
    const renderedHTML = fs.readFileSync(eventsPath, 'utf8');
    const modifiedHTML = renderedHTML
        .replace('{{userName}}', req.session.userName || '')
        .replace('{{classYear}}', req.session.classYear || '');

    res.send(modifiedHTML);
});



// Route for the admin page
app.get('/admin', async (req, res) => {
    console.log('Received request for /admin');
    try {
        const adminModel = new AdminModel();
        const alumni = await adminModel.getAllAlumni();
        const adminPath = path.join(__dirname, 'public', 'HTML', 'admin.html');
        const adminRenderedHTML = fs.readFileSync(adminPath, 'utf8');
        const adminModifiedHTML = adminRenderedHTML
            .replace('{{userName}}', req.session.userName || '')
            .replace('{{classYear}}', req.session.classYear || '');

        res.send(adminModifiedHTML);
    } catch (error) {
        console.error('Error fetching alumni:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use('/events', eventRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);

// Logging middleware
app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.originalUrl}`);
    next();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
