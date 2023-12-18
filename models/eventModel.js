const nedb = require('gray-nedb');
const db = new nedb({ filename: 'events.db', autoload: true });
// const shortid = require('shortid');
console.log('database connected to: ' + db.filename);

const imagePath = '/public/uploads/';
console.log(imagePath);
class Event {
    constructor({ title, description, location, category, startDateTime, endDateTime, image, userId, sequenceNumber }) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.category = category;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.image = image;
        this.userId = userId;
        this.sequenceNumber = sequenceNumber;
        this.rsvps = [];
    }

    static create({ title, description, location, category, startDateTime, endDateTime, image, userId }, callback) {
        console.log('Create function called with:', { title, description, location, category, startDateTime, endDateTime, image }, userId);
        console.log('Type of callback:', typeof callback);
        const eventImages = imagePath + image;

        Event.getNextSequenceNumber((err, sequenceNumber) => {
            if (err) {
                if (callback) {
                    return callback(err);
                } else {
                    console.error(err);
                    return;
                }
            }

            const event = new Event({
                title,
                description,
                location,
                category,
                startDateTime,
                endDateTime,
                image: eventImages,
                userId,
                sequenceNumber
            });

            db.insert(event, (err, newEvent) => {
                if (err) {
                    if (callback) {
                        return callback(err);
                    } else {
                        console.error(err);
                        return;
                    }
                }

                if (callback) {
                    callback(null, newEvent);
                } else {
                    console.log('Event created successfully:', newEvent);
                }
            });
        });
    }


    static getNextSequenceNumber(callback = () => { }) {
        db.find({}, { sequenceNumber: 1 }).sort({ sequenceNumber: -1 }).limit(1).exec((err, events) => {
            if (err) {
                console.error('Error finding events:', err);
                callback(err);
            } else {
                const lastEvent = events[0];
                const nextSequenceNumber = lastEvent ? lastEvent.sequenceNumber + 1 : 1;
                callback(null, nextSequenceNumber);
            }
        });
    }
    // render events on the events page
    // Read events
    static getAll({ userId }) {
        console.log('getAll called with userId: ', userId);

        return new Promise((resolve, reject) => {
            db.find({ userId: userId }, (err, events) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log('Received events: ', events);
                    resolve(events);
                }
            });
        });
    }

    // Find event
    static getEventById(id, callback) {
        return new Promise((resolve, reject) => {
            db.findOne({ _id: id }, (err, event) => {
                if (err) {
                    callback(err);
                    reject(err);
                } else {
                    console.log('success');
                    resolve(event);
                }
              
            });
        });
    }
    // update event
    static updateEvent(id, updatedFields, callback) {
        console.log('Updating event with ID', id);
        console.log('Updated Fields', updatedFields);
        return new Promise((resolve, reject) => {
            // Update the event in the database using the eventId and updatedFields
            db.update({ _id: id }, { $set: updatedFields }, {}, function (err, numReplaced) {
                if (err) {
                    console.error('Error updating event:', err);
                    reject(err);
                }

                if (numReplaced === 0) {
                    console.error('Event not found for update');
                    reject(new Error('Event not found for update'));
                }

                console.log('Event updated successfully. Num replaced:', numReplaced);
                console.log("Updated fields", updatedFields);
                resolve(updatedFields);
              
            });
        });
    }


// Get all events
// Get all events with optional category filter
static getAllEvents({ category } = {}) {
    const query = category ? { category } : {};
    return new Promise((resolve, reject) => {
        db.find(query, (err, events) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log('Received filtered events: ', events);
                resolve(events);
            }
        });
    });
}

// update rsvps to an event
static rsvpToEvent(eventId, user, callback) {
    console.log('RSVP request for eventId:', eventId, 'user:', user);
    db.update(
        { _id: eventId },
        { $addToSet: { rsvps: user } },  // Add the user information to the rsvps array
        {},
        function (err, numReplaced) {
            if (err) {
                console.error('Error updating event for RSVP:', err);
                if (callback) {
                    callback(err);
                }
            } else {
                console.log('RSVP successful. Num replaced:', numReplaced);
                if (callback) {
                    callback(null);
                }
            }
        }
    );
}


// Get saved events for a user
static getSavedEvents({ userId }) {
    console.log('getSavedEvents called with userId:', userId);

    return new Promise((resolve, reject) => {
        db.find({ 'rsvps': { userId} }, (err, events) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log('Received saved events: ', events);
                resolve(events);
            }
        });
    });
}

// Cancel the rsvp
static cancelRSVP(eventId, { userId }) {
    console.log('Cancel RSVP request for eventId:', eventId, 'user:', { userId });

    return new Promise((resolve, reject) => {
        // Update your database to remove the user's RSVP for the specified event
        db.update(
            { _id: eventId },
            { $pull: { rsvps: { userId } } },
            {},
            (err, numReplaced) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log('Cancel successful. Num replaced:', numReplaced);
                    resolve(numReplaced);
                }
            }
        );
    });
}

    // Delete Event
    static deleteEvent(id, callback) {

    console.log(`Deleting event of ID: ${id}`);
    return new Promise((resolve, reject) => {
        db.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
                reject(err);
            } else {
                resolve(numRemoved);

            }
        });
    });
}

static getCreatedEventsCount(userId) {
    return new Promise((resolve, reject) => {
      db.count({ userId }, (err, count) => {
        if (err) {
          console.error('Error getting created events count: ', err);
          reject(err);
        } else {
          console.log('Created events count found', count);
          resolve(count);
        }
      });
    });
  }

  // Get the count of events RSVP'd by a specific alumni
  static getSavedEventsCount(userId) {
    return new Promise((resolve, reject) => {
      db.count({ 'rsvps.userId': userId }, (err, count) => {
        if (err) {
          reject(err);
        } else {
          resolve(count);
        }
      });
    });
  }


}

module.exports = Event;


