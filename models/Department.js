const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
{
	name: 
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

const Department = mongoose.model('Department', DepartmentSchema);
module.exports = Department;