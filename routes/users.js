const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const Department = require('../models/Department');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

var async = require('async');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', ensureAuthenticated, (req, res) => 
{
	try
	{
		Department.find({}, function(err, data)
		{
			if (err) throw err;
			res.render('register', { deptdata: data });
		});
	}
	catch (e) 
	{
	    next(e);
	}
});
//Register
router.post('/register', ensureAuthenticated, (req, res) => 
{
	const { name, department, username, password, password2 } = req.body;
	let errors = [];
	let locals = {};
	var deptdata;
	
	if (!name || !username || !department || !password || !password2) 
	{
		errors.push({ msg: 'Please enter all fields' });
	}
	if (password != password2) 
	{
		errors.push({ msg: 'Passwords do not match' });
	}
	if (password.length < 6) 
	{
		errors.push({ msg: 'Password must be at least 6 characters' });
	}
	if (errors.length > 0) 
	{	
		async.parallel(
		[
			function(callback) 
			{
				Department.find({}, function(err, data)
				{
					if (err) 
						throw err;
					locals.deptdata = data;
					callback();
				});
			}
		], function(err)
		{
			res.render('register', {errors,
				name,
				username,
				department,
				password,
				password2, deptdata:locals.deptdata});
		});
	} 
	else 
	{
		User.findOne({ username: username }).then(user => 
		{
			if (user) 
			{
				errors.push({ msg: 'Username already exists' });
				async.parallel(
				[
					function(callback) 
					{
						Department.find({}, function(err, data)
						{
							if (err) 
								throw err;
							locals.deptdata = data;
							callback();
						});
					}
				], function(err)
				{
					res.render('register', {errors,
						name,
						username,
						department,
						password,
						password2, deptdata:locals.deptdata});
				});
			} 
			else 
			{
				const newUser = new User(
				{
					name,
					username,
					department,
					password
				});
				bcrypt.genSalt(10, (err, salt) => 
				{
					bcrypt.hash(newUser.password, salt, (err, hash) => 
					{
						if (err) 
							throw err;
						newUser.password = hash;
						newUser
						.save()
						.then(user => 
						{
							req.flash(
							  'success_msg',
							  'You are now registered and can log in');
							res.redirect('/users/login');
						})
						.catch(err => console.log(err));
					});
				});
			}
		});
	}
});
// user List page
router.get('/usrlist', ensureAuthenticated, (req, res, next) => 
{
	try
	{
		User.find({}, function(err, data)
		{
			if (err) throw err;
			res.render('usrlist', { userlst: data });
		});
	}
	catch (e) 
	{
	    next(e);
	}
});


router.get('/edit_user', ensureAuthenticated, (req, res, next) => 
{
	var locals = {};
    var userdata,deptdata; 
	async.parallel(
	[
		function(callback) 
		{
			User.findById(req.query.id, function(err, data)
			{
				if (err) 
					throw err;
				locals.userdata = data;
				callback();
			});
		},
		function(callback) 
		{
			Department.find({}, function(err, data)
			{
				if (err) 
					throw err;
				locals.deptdata = data;
				callback();
			});
		}
	], function(err)
	{
		res.render('edit_user', {userdata:locals.userdata, 
			deptdata:locals.deptdata});
	});
});

router.post('/edit_user', ensureAuthenticated, (req, res, next) => 
{
	const { id, name, username, department, password, password2 } = req.body;
	//console.log(id, name, username, department, password);
	let errors = [];
	let locals = {};
	var deptdata;
	if (!name ) 
	{
		errors.push({ msg: 'Please enter name' });
	}
	if ( !department ) 
	{
		errors.push({ msg: 'Please enter department' });
	}
	if(password)
	{
		if (password != password2) 
		{
			errors.push({ msg: 'Passwords do not match' });
		}
		if (password.length < 6) 
		{
			errors.push({ msg: 'Password must be at least 6 characters' });
		}
	}	
	if (errors.length > 0) 
	{	
		async.parallel(
		[
			function(callback) 
			{
				User.findById(id, function(err, data)
				{
					if (err) 
						throw err;
					locals.userdata = data;
					callback();
				});
			},
			function(callback) 
			{
				Department.find({}, function(err, data)
				{
					if (err) 
						throw err;
					locals.deptdata = data;
					callback();
				});
			}
		], function(err)
		{
			res.render('edit_user', {errors,
				userdata:locals.userdata, 
				deptdata:locals.deptdata});
		});
	}
	else 
	{
		const newUser = new User(
		{
			name,
			department,
			password
		});
		bcrypt.genSalt(10, (err, salt) => 
		{
			bcrypt.hash(newUser.password, salt, (err, hash) => 
			{
				if (err) 
					throw err;
				newUser.password = hash;
				User.findByIdAndUpdate(id, newUser, function(err)
				{
					if (err) 
						return res.send(500, { error: err });
					else
					{
						req.flash(
								  'success_msg',
								  'User info edited successfully');
								res.redirect('/users/usrlist');
					}
					
				}).catch(err => console.log(err));
			});
		});
	}
});

//Delete user
router.get('/delete_user', ensureAuthenticated, (req, res, next) => 
{
	try
	{
		var query = { _id: req.query.id };
		User.remove(query, function(err, result)
		{
			req.flash('success_msg', 'Record delete successful');
			res.redirect('/users/usrlist');
		});
	}
	catch (e) 
	{
	    next(e);
	}
});

// Login
router.post('/login', (req, res, next) => 
{
	passport.authenticate('local', 
	{
		successRedirect: '/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

// Logout
router.get('/logout', (req, res) => 
{
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

module.exports = router;