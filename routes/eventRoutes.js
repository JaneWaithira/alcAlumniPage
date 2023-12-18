const express = require('express');
const router = express.Router();
const Mustache = require('mustache');
const Event = require('../models/eventModel');
const multer = require('multer');
const fs = require('fs'); 
const path = require('path');
// const eventController = require('../controllers/eventController');

const addEventTemplatePath = path.join(__dirname, '../views/addEvent.mustache');
const myEventsTemplatePath = path.join(__dirname, '../views/myEvents.mustache');
const eventsTemplatePath = path.join(__dirname, '../views/allEvents.mustache');
const addEventTemplate = fs.readFileSync(addEventTemplatePath, 'utf8');
const myEventsTemplate = fs.readFileSync(myEventsTemplatePath, 'utf8');

const uploadPath = path.join(__dirname,'..', 'public', 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Render addEvent template
router.get('/addEvent', (req, res) => {
    res.send(addEventTemplate);
});

// Create a new event
router.post('/addEvent', upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        const relativeImagePath = path.relative(uploadPath, imagePath).replace(/\\/g, '/');
        console.log(relativeImagePath);
        

        const userId = req.session.userId;
        const newEvent = await Event.create({
            title: req.body.title,
            description: req.body.description,
            location: req.body.location,
            category: req.body.category,
            startDateTime: req.body.startDateTime,
            endDateTime: req.body.endDateTime,
            image: relativeImagePath,
            userId: req.session.userId
        });

        res.redirect('/events?message=Event added successfuly');
    } catch (err) {
        console.error(err);
        res.redirect('/events?message=Error creating event');
        
    }
});


//Render all events on the events page
router.get('/allEvents', async (req, res) => {
    try {
        const { category } = req.query;
        const events = await Event.getAllEvents({ category });
        console.log('Filtered events by category:', events);
        res.render('allEvents', { events });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching events');
    }
});

// Fetch all events as JSON for index page
router.get('/allEventsJson', async (req, res) => {
    try {
        const { category } = req.query;
        const events = await Event.getAllEvents({ category });
        console.log('Filtered events by category:', events);
        res.json({ events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching events' });
    }
});


// Render savedEvents template with user-specific events
router.get('/savedEvents', async (req, res) => {
    const userId = req.session.userId;

    try {
        const events = await Event.getSavedEvents({ userId: userId });
        console.log('Received saved events: ', events);

        // Use the savedEventsTemplate directly without additional rendering
        res.render('savedEvents', { events: events });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching saved events');
    }
});

// save event 
router.post('/rsvp/:id', async (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.userId;
    console.log('Received RSVP request. Event ID:', eventId, 'User ID:', userId);
    try {
        // Pass an object representing the user
        await Event.rsvpToEvent(eventId, { userId });
        res.status(200).send('RSVP successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server error');
    }
});

// Cancel rsvp
// In your server-side route for canceling RSVP
router.post('/cancel/:id', async (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.userId;

    try {
        // Pass an object representing the user
        await Event.cancelRSVP(eventId, { userId });
        res.status(200).send('Cancel successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server error');
    }
});




// Delete an event
router.delete('/myEvents/:id', async (req, res) => {
    const eventId = req.params.id;
    console.log('Delete request received for event ID: ', eventId);

    try {
        await Event.deleteEvent(eventId);
        res.status(204).end(); // No Content for successful deletion
    } catch (err) {
        console.error('Error deleting event: ', err);
        res.status(500).send('Internal server error');
    }
});

// Render myEvents template with user-specific events
router.get('/myEvents', async (req, res) => {
    const userId = req.session.userId;

    try {
        console.log("calling  Event.getAll with userId: ", userId);
        const events = await Event.getAll({ userId: userId });
        console.log('Received events: ', events);

        // Use the myEventsTemplate directly without additional rendering
        res.render('myEvents', { events: events });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching events');
    }
});


// Get details of a specific event by ID as JSON
router.get('/myEvents/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await Event.getEventById(eventId);
        res.status(200).json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching event details' });
    }
});

// Update an event by its ID
router.put('/myEvents/:id', async (req, res) => {
    const eventId = req.params.id;
    console.log('Received event ID', eventId);
    const updatedFields = req.body;

    try {
        await Event.updateEvent(eventId, updatedFields);
        const allEvents = await Event.getAll({ userId: req.session.userId });
        res.status(200).json({ updatedFields, allEvents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating event' });
    }

   
});

module.exports = router;
