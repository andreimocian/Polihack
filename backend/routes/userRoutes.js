const passport = require('passport');
authController = require('../controllers/authController');
const express = require('express');

const router = express.Router();

router.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/api/v1/users/me',
        failureRedirect: '/api/v1/users/auth/failure'
    })
);

router.get('/auth/failure', (req, res) => {
    res.send('Something went wrong...');
})

router.get('/me', authController.protect, (req, res) => {
    console.log(req.user);
    res.send('Hello!');
})

router.post('/logout', (req, res) => {
    req.session.destroy();
    req.logOut((err) => {
        if (err) {
            return res.send(err, 404);
        }
    });
    res.send('Goodbye');
});

module.exports = router;