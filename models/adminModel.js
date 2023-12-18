const Datastore = require('gray-nedb');
const dbFilePath = './users.db';


class AdminModel {
  constructor() {
    this.usersDB = new Datastore({ filename: dbFilePath, autoload: true });
    console.log('DB Connected to ' + dbFilePath);
  }

  // Get all alumni
  getAllAlumni() {
    return new Promise((resolve, reject) => {
      this.usersDB.find({}, (err, alumni) => {
        if (err) {
          console.error('Error getting alumni: ', err);
          reject(err);
        } else {
          console.log('Alumni found', alumni);
          resolve(alumni);
        }
      });
    });
  }

  // Get alumni by ID
  getAlumniById(id) {
    return new Promise((resolve, reject) => {
      this.usersDB.findOne({ _id: id }, (err, alumni) => {
        if (err) {
          console.error('Error getting alumni by ID: ', err);
          reject(err);
        } else {
          console.log('Alumni found', alumni);
          resolve(alumni);
        }
      });
    });
  }

  // Update alumni
  updateAlumni(id, newData) {
    return new Promise((resolve, reject) => {
      this.usersDB.update({ _id: id }, { $set: newData }, {}, (err, numReplaced) => {
        if (err) {
          console.error('Error updating alumni: ', err);
          reject(err);
        } else {
          console.log('Alumni updated successfully');
          resolve(numReplaced);
        }
      });
    });
  }

  // Delete alumni
  deleteAlumni(id) {
    return new Promise((resolve, reject) => {
      this.usersDB.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) {
          console.error('Error deleting alumni: ', err);
          reject(err);
        } else {
          console.log('Alumni deleted successfully');
          resolve(numRemoved);
        }
      });
    });
  }
// add alumni
  addAlumni(newAlumni) {
    return new Promise((resolve, reject) => {
      this.usersDB.insert(newAlumni, (err, alumni) => {
        if (err) {
          console.error('Error adding alumni: ', err);
          reject(err);
        } else {
          console.log('Alumni added successfully');
          resolve(alumni);
        }
      });
    });
  }

  
  findUserByEmail(email) {
    console.log('searching for user with email', email);
    return new Promise((resolve, reject) => {
      this.usersDB.findOne({ email }, (err, user) => {
        if (err) {
          console.error('Error finding user: ', err);
          reject(err);
        } else {
          console.log('User found', user);
          resolve(user);
        }
      });
    });
  }

};


module.exports = AdminModel;
