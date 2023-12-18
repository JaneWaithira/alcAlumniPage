const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


// // Get all alumni records
router.get('/alumni', adminController.getAllAlumni);


// Get alumni record by ID
router.get('/alumni/:id', adminController.getAlumniById);

// Update alumni record
router.put('/alumni/:id', adminController.updateAlumni);

// Delete alumni record
router.delete('/alumni/:id', adminController.deleteAlumni);

router.get('/events', adminController.getAllEvents);

router.delete('/myEvents/:id', adminController.deleteEvent);

// router.get('/admin/addAlumni', adminController.handleAddAlumni);
router.post('/addAlumni', adminController.addAlumni);

module.exports = router;
