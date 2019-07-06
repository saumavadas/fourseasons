const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Booking = require('../models/Booking');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/booking_list', ensureAuthenticated, (req, res, next) => 
{
	try
	{
		Booking.find({}, function(err, data)
		{
			if (err) throw err;
			res.render('booking_list', { listdata: data });
		});
	}
	catch (e) 
	{
	    next(e);
	}
});

router.get('/booking_frm', ensureAuthenticated, (req, res, next) => 
{
	try
	{
		Booking.find({}, function(err, data)
		{
			if (err) throw err;
			res.render('booking_frm', { listdata: data });
		});
	}
	catch (e) 
	{
	    next(e);
	}
});

module.exports = router;