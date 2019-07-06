const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

// Passport Config
require('./config/passport')(passport);

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/fsc',{ useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'))

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use
(
	session(
	{
		secret: 'secret',
		resave: true,
		saveUninitialized: true
	})
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) 
{
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/bookings', require('./routes/bookings.js'));
//app.use('/suppliers', require('./routes/suppliers.js'));
//app.use('/clients', require('./routes/clients.js'));



const PORT = process.env.PORT || 5005;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
