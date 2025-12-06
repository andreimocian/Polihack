const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const passport = require('passport');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(cors({
    credentials: true
}));

app.use(express.json());

app.use(express.json());
app.use(session({
    secret: 'cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/users', userRouter);

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Merge!!!"
    });
});

module.exports = app;