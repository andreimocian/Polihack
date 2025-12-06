const passport = require('passport');
authController = require('../controllers/authController');
const express = require('express');
const dotenv = require('dotenv');

const router = express.Router();

router.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: `${process.env.FRONTEND_URL}/redirect`,
        failureRedirect: `${process.env.FRONTEND_URL}/login`
    })
);

router.get('/auth/failure', (req, res) => {
    res.send('Something went wrong...');
})

router.get('/me', authController.protect, (req, res) => {
    console.log(req.user);
    res.send('Hello!');
})

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.session.destroy();
        res.redirect(`${process.env.FRONTEND_URL}/login`);
    });
});



module.exports = router;