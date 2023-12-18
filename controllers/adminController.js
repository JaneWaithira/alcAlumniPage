const UserModel = require('../models/authModel');
const AdminModel = require('../models/adminModel');
const EventModel = require('../models/eventModel')
// const newUserModel = new UserModel();


const adminController = {
  getAllAlumni: async (req, res) => {
    try {
      console.log('Fetching all alumni');
      const adminModelInstance = new AdminModel(); // Create an instance
      const alumni = await adminModelInstance.getAllAlumni();

      // Fetch counts for Created Events and Saved Events for each alumni
      const alumniWithCounts = await Promise.all(alumni.map(async (alum) => {
        const createdEventsCount = await EventModel.getCreatedEventsCount(alum._id);
        const savedEventsCount = await EventModel.getSavedEventsCount(alum._id);

        return { ...alum, createdEventsCount, savedEventsCount };
      }));

      console.log("Alumni with Counts", alumniWithCounts);

      // Assuming you want to render the 'alumni' view
      res.render('alumni', { alumni: alumniWithCounts });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching alumni' });
    }
  },
  

  getAlumniById: async (req, res) => {
    const id = req.params.id;
    try {
      const alumni = await new AdminModel.getAlumniById(id);
      if (!alumni) {
        res.status(404).json({ error: 'Alumni not found' });
      } else {
        res.json(alumni);
      }
    } catch (error) {
      console.error('Error getting alumni by ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  updateAlumni: async (req, res) => {
    const id = req.params.id;
    const newData = req.body; // Assuming you send updated data in the request body
    try {
     const numReplaced = await new AdminModel().updateAlumni(id, newData);
      res.json({ success: true, numReplaced });
    } catch (error) {
      console.error('Error updating alumni:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  deleteAlumni: async (req, res) => {
    const id = req.params.id;
    try {
      const numRemoved = await new AdminModel().deleteAlumni(id);
      res.json({ success: true, numRemoved });
    } catch (error) {
      console.error('Error deleting alumni:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getAllEvents: async (req, res) => {
    try {
      console.log('Fetching all events');
      const events = await EventModel.getAllEvents();

      // Assuming you want to render the 'adminEvents' view
      res.render('adminEvents', { events });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching events' });
    }
  },

  // delete events
  deleteEvent: async (req, res) => {
    const eventId = req.params.id;
    try {
        const numRemoved = await EventModel.deleteEvent(eventId);
        res.json({ success: true, numRemoved });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
},

addAlumni: async (req, res) => {
  const { name, email, year } = req.body;

  try {

    // Call the addAlumni function in the model
    const adminModelInstance = new AdminModel();

    const newAlumni = await adminModelInstance.addAlumni({ name, email, year });
    res.status(200).json({success: true, message: 'Alumni added succesfully', newAlumni });

    console.log('Alumni added successfully:', email);
    // return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding alumni:', error);
    return res.status(500).json({ success: false, error: 'An error occurred' });
  }
}


};

module.exports = adminController;
