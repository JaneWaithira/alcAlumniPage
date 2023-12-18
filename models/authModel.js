const Datastore = require('gray-nedb');
const dbFilePath = './users.db';


class UserModel {
    constructor() {
            this.usersDB = new Datastore({filename: dbFilePath, autoload: true});
            console.log('DB Connected to' +dbFilePath);    
        
    }
    createUser(user) {
        console.log('Creating User', user);
      return new Promise((resolve, reject) => {
        this.usersDB.insert(user, (err, newUser) => {
          if (err) {
            console.error('Error inserting user: ', err);
            reject(err);
          } else {
            console.log('User inserted successfully', newUser);
            resolve(newUser);
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

  }
  
  module.exports = UserModel;


