const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const UserModel = require('../models/authModel');
const newUserModel = new UserModel();
const bcrypt = require('bcrypt');

// Render login form
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
router.post('/login', [
    check('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    check('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('login', { errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await newUserModel.findUserByEmail(email);
        if (!user) {
            return res.render('login', { errorMessage: 'Email is not registered. Please register' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.render('login', { errorMessage: 'Incorrect password. please try again' });
        }

        if (user.email.endsWith('@alumniadmin.com')) {
            req.session.regenerate(function (err) {
                // Handle any errors if needed
                req.session.userId = user._id;
                req.session.userName = user.name;
                req.session.classYear = user.year;
                console.log("this is the username", user.name);
                console.log("this is the username", user.year);
                return res.redirect('/admin');
            });
        } else {
            // store user sID in the session
            req.session.userId = user._id;
            req.session.userName = user.name;
            req.session.classYear = user.year;
            console.log("this is the username", user.name);
            console.log("this is the username", user.year);
            // redirect normal users to events page
            res.redirect('/events');
        }
    } catch (error) {
        console.error(error);
        return res.render('login', { errorMessage: 'An error occurred' });
    }
});


// Render register form
router.get('/register', (req, res) => {
    res.render('register');
});

// Handle register form submission
router.post('/register', [
    check('name').notEmpty().withMessage('Name is required'),
    check('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .custom((value) => {
            // Check email format
            if (!(value.endsWith('@alcalumni.com') || value.endsWith('@alumniadmin.com'))) {
                throw new Error('Invalid email domain. Use @alcalumni.com');
            }
            return true;
        }),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
], async (req, res) => {
    const { name, year, email, password, confirmPassword } = req.body;
    const errors = validationResult(req).mapped();

    if (Object.keys(errors).length > 0) {
        console.log('Validation errors:', errors);
        return res.status(422).render('register', {
            errors: errors,
            name: name,
            year: year,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        });
    }

    try {
        console.log('Received registration request for:', email);
        const existingUser = await newUserModel.findUserByEmail(email);
        if (existingUser) {
            console.log('User already registered:', email);
            return res.status(422).render('register', {
                errors: { email: { msg: 'Email already registered' } },
                name: name,
                year: year,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await newUserModel.createUser({ name, year, email, password: hashedPassword });
        // Send confirmation to client
        res.cookie('registrationConfirmation', 'Registration confirmed', { maxAge: 5000 });
        // store user id and name in session
        const user = await newUserModel.findUserByEmail(email);
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.classYear = user.year;
        console.log("this is the username", user.name);
        console.log("this is the year", user.year);

        console.log('User registered successfully:', email);
        return res.redirect('login');
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).render('register', {
            errors: errors,
            name: name,
            year: year,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        });
    }
});
module.exports = router;
