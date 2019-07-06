const mongoose = require('mongoose');
//const mongoosePaginate = require('mongoose-paginate');

const UserSchema = new mongoose.Schema(
{
	name: 
	{
		type: String,
		required: true
	},
	username:
	{
		type: String,
		required: true
	},
	department:
	{
		type: String,
		required: true
	},
	password: 
	{
		type: String,
		required: true
	},
	date: 
	{
		type: Date,
		default: Date.now
	}
});

//UserSchema.plugin(mongoosePaginate);
const User = mongoose.model('User', UserSchema);

module.exports = User;