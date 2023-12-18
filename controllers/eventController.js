// const Event = require('../models/eventModel');

// const eventController = {
//     showAddEvent: (req, res) => {
//         res.render('addEvent');
//     },

//     addEvent: (req, res) => {
//         const { title, description, location, category, startDateTime, endDateTime, image } = req.body;

//         // Get user ID from session
//         const userId = req.session.userId;

//         // Check if the user is logged in
//         if (!userId) {
//             return res.status(401).send('User not logged in');
//         }

//         Event.create({
//             title,
//             description,
//             location,
//             category,
//             startDateTime,
//             endDateTime,
//             image,
//             userId,  // Associate the user ID with the event
//         }, (err, event) => {
//             if (err) {
//                 console.error(err);
//                 // Handle the error, e.g., send an error response
//                 return res.status(500).send('Error adding event');
//             }

//             // Handle the success scenario, e.g., redirect to myEvents page
//             res.redirect('/events');
//         });
//     },

    // showAllEvents: (req, res) => {
    //     const { category } = req.query;
    //     Event.getAllEvents({ category }, (err, events) => {
    //         if (err) {
    //             console.error(err);
    //             // Handle the error, e.g., send an error response
    //             res.status(500).send('Error fetching events');
    //         } else {
    //             //  res.render('events', { events });
    //             res.render('allEvents', { events });
    //         }
    //     });
    // },

    // showMyEvents: (req, res) => {
    //     // Get user ID from session
    //     const userId = req.session.userId;
    //     Event.getAll({ userId }, (err, events) => {
    //         if (err) {
    //             console.error(err);
    //             // req.flash('error_msg', 'Error fetching events');
    //             res.redirect('/events/myEvents');
    //         } else {
    //             res.render('myEvents', { events });
    //         }
    //     });
    // },

    // showEventDetails: (req, res) => {
    //     const eventId = req.params.id;
    //     Event.getEventById(eventId, (err, event) => {
    //         if (err) {
    //             console.error(err);
    //             // req.flash('error_msg', 'Error fetching event details');
    //             res.redirect('/events/myEvents');
    //         } else {
    //             res.render('eventDetails', { event });
    //         }
    //     });
    // },

    // showEditEvent: (req, res) => {
    //     const eventId = req.params.id;
    //     Event.getEventById(eventId, (err, event) => {
    //         if (err) {
    //             console.error(err);
    //             // req.flash('error_msg', 'Error fetching event details');
    //             // res.redirect('/events/myEvents');
    //             res.status(500).send('Error fetching event details');
    //         } else {
    //             res.render('editEvent', { event });
    //         }
    //     });
    // },

    // // Update event function in the controller
    // editEvent: (req, res) => {
    //     const eventId = req.params.id;
    //     const updatedFields = req.body;

    //     Event.updateEvent(eventId, updatedFields, (err, updatedEvent) => {
    //         if (err) {
    //             console.error(err);
    //             res.status(500).json({ error: 'Error updating event' });
    //         } else {
    //             // Send a success response indicating successful update
    //             res.status(200).json({ updatedEvent });
    //         }
    //     });
    // },

    // // Show saved events
    // showSavedEvents: async (req, res) => {
    //     // Get user ID from session
    //     const userId = req.session.userId;
    
    //     try {
    //         const events = await Event.getSavedEvents({ userId: userId });
    //         console.log('Received saved events: ', events);
    
    //         // Use the savedEventsTemplate directly without additional rendering
    //         res.render('savedEvents', { events: events });
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).send('Error fetching saved events');
    //     }
    // },
    

    // deleteEvent: (req, res) => {
    //     const eventId = req.params.id;
    //     Event.deleteEvent(eventId, (err, numRemoved) => {
    //         if (err) {
    //             console.error(err);
    //             // req.flash('error_msg', 'Error deleting event');
    //         } else {
    //             if (numRemoved === 1) {
    //                 // req.flash('success_msg', 'Event deleted successfully');
    //             } else {
    //                 // req.flash('error_msg', 'Event not found');
    //             }
    //         }
    //         res.redirect('/events/myEvents');
    //     });
    // }
// };
// module.exports = eventController;
