const UserModel = require('../models/authModel');
const newUserModel = new UserModel();
const bcrypt = require('bcrypt');


const authController = {
  renderLoginForm: (req, res) => {
    res.render('login');
  },
  
  renderRegisterForm: (req, res) => {
    res.render('register');
  },

  handleLogin: async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await newUserModel.findUserByEmail(email);
        if (!user) {
            return res.render('login', {errorMessage: 'Email is not registered. Please register'});
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          return res.render('login', {errorMessage: 'Incorrect password. please try again'});
        }

        // check if user is an admin
        if (user.email.endsWith('@alumniadmin.com')) {
          return res.redirect('/admin');
        }

        res.redirect('/');
    } catch (error) {
        console.error(error);
        return res.render('login', { errorMessage: 'An error occurred' });
    }
  },

  handleRegister: async (req, res) => {
    const { name, year, email, password } = req.body;
    const errors = [];
    // check email format
    if (!email.endsWith('@alcalumni.com') && !email.endsWith('@alumniadmin.com')) {
      errors.push({type: 'field', value: email, msg: 'Invalid email domain. Use @alumni.com', path: 'email', location: 'body'});
    }
    // check password length
    if(password.length < 6 ){
      errors.push({type: 'field', value: password, msg: 'Password must be at least 6 characters', path: 'password', location: 'body'});
    }

    // Check if passwords match
    if(password !== confirmPassword) {
      errors.push({type: 'field', value: confirmPassword, msg: 'passwords do not match', path: 'confirmPassword', location: 'body'});
    }

    // check if an admin already exists
    const adminExists = await newUserModel.findUserByEmail('admin@alumniadmin.com');
    if (adminExists) {
      errors.push({type: 'field', value: email, msg: 'Admin already exists', path: 'email', location: 'body'});
    }

    if (errors.length > 0 ){
      // If there are errors, render registration form with errors
      console.log('Validation errors: ', errors);
      return res.status(422).render('register', { errors });
    }
    try {
      console.log('Received registration request for:', email);
      const existingUser = await newUserModel.findUserByEmail(email);
      if (existingUser) {
          console.log('User already registered:', email);
          return res.status(422).render('register', { errorMessage: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await newUserModel.createUser({ name, year, email, password: hashedPassword });
      console.log('User registered successfully:', email);
      return res.redirect('login');
  } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).render('register', { errorMessage: 'An error occurred' });
  }
}
};
module.exports = authController;
