const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
{
	f_name: 
	{
		type: String,
		required: true
	},
	l_name: 
	{
		type: String,
		required: true
	},
	email: 
	{
		type: String,
		required: true
	},
	phone: 
	{
		type: String,
		required: true
	},
	desc:
	{
		type: String
	},
	resources:
	[{
		type: String
	}],
	date: 
	{
		type: Date,
		default: Date.now
	}
});

const Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;