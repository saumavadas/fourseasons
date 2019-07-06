const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Department = require('../models/Department');
const Resource = require('../models/Resource');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
var async = require('async');

router.get('/deptlist', ensureAuthenticated, (req, res, next) => 
{
	try
	{
		Department.find({}, function(err, data)
		{
			if (err) throw err;
			res.render('deptlist', { listdata: data });
		});
	}
	catch (e) 
	{
	    next(e);
	}
});


router.get('/form', ensureAuthenticated, (req, res, next) => 
{
	let locals = {};
	if(req.query.id)
	{
		try
		{	
			async.parallel(
			[
				function(callback) 
				{
					Department.findById(req.query.id, function(err, data)
					{
						if (err) 
							throw err;
						locals.deptdata = data;
						callback();
					});
				},
				function(callback) 
				{
					Resource.find({}, function(err, data)
					{
						if (err) 
							throw err;
						locals.resource = data;
						callback();
					});
				}
			], function(err)
			{
				res.render('deptfrm', { department:locals.deptdata, resource:locals.resource});
			});
		}
		catch (e) 
		{
		    next(e);
		}
	}
	else
	{
		try
		{	
			async.parallel(
			[
				function(callback) 
				{
					Resource.find({}, function(err, data)
					{
						if (err) 
							throw err;
						locals.resource = data;
						callback();
					});
				}
			], function(err)
			{
				res.render('deptfrm', { department:{}, resource:locals.resource});
			});
		}
		catch (e) 
		{
		    next(e);
		}
	}
});

router.post('/create', ensureAuthenticated, (req, res) => 
{	
	const { name, desc, resources } = req.body;
	let errors = [];
	let data = [];
	let locals = {};
	
	if (!name) 
	{
		errors.push({ msg: 'Enter department name' });
	}
	if (errors.length > 0) 
	{
		try
		{	
			async.parallel(
			[
				function(callback) 
				{
					Resource.find({}, function(err, data)
					{
						if (err) 
							throw err;
						locals.resource = data;
						callback();
					});
				}
			], function(err)
			{
				res.render('deptfrm', { errors,department:{"name":name,
					"desc":desc}, resource:locals.resource});
			});
		}
		catch (e) 
		{
		    next(e);
		}
	} 
	else
	{
		Department.findOne({ name: name }).then(department => 
		{
			if (department) 
			{
				errors.push({ msg: 'Department already exists' });
				try
				{	
					async.parallel(
					[
						function(callback) 
						{
							Resource.find({}, function(err, data)
							{
								if (err) 
									throw err;
								locals.resource = data;
								callback();
							});
						}
					], function(err)
					{
						res.render('deptfrm', { errors,department:{"name":name,
							"desc":desc}, resource:locals.resource});
					});
				}
				catch (e) 
				{
				    next(e);
				}
			} 
			else
			{
				const newDepartment = new Department(
				{
					name,
					desc,
					resources
				});
				newDepartment.save().then(department => 
				{
					req.flash(
					  'success_msg',
					  'New Department created successfully');
					res.redirect('/departments/deptlist');
				})
				.catch(err => console.log(err));
			}
		});
	}
});

router.post('/edit', ensureAuthenticated, (req, res, next) => 
{
	const { id,name, desc, resources } = req.body;
	let errors = [];
	let data = [];
	let locals = {};
	
	if (!name) 
	{
		errors.push({ msg: 'Enter department name' });
	}
	if (errors.length > 0) 
	{
		try
		{	
			async.parallel(
			[
				function(callback) 
				{
					Resource.find({}, function(err, data)
					{
						if (err) 
							throw err;
						locals.resource = data;
						callback();
					});
				}
			], function(err)
			{
				res.render('deptfrm', { errors,department:{"name":name,
					"desc":desc}, resource:locals.resource});
			});
		}
		catch (e) 
		{
		    next(e);
		}
	}
	else
	{
		const newDepartment = 
		{
			name,
			desc,
			resources
		};
		Department.findByIdAndUpdate(id, newDepartment, function(err)
		{
			if (err) 
				return res.send(500, { error: errors });
			else
			{
				req.flash(
						  'success_msg',
						  'Department edited successfully');
						res.redirect('/departments/deptlist');
			}	
		})
		.catch(err => console.log(err));
	}
});

//Delete user
router.get('/delete_object', ensureAuthenticated, (req, res, next) => 
{
	try
	{
		var query = { _id: req.query.id };
		Department.deleteOne(query, function(err, result)
		{
			req.flash('success_msg', 'Record delete successful');
			res.redirect('/departments/deptlist');
		});
	}
	catch (e) 
	{
	    next(e);
	}
});

module.exports = router;