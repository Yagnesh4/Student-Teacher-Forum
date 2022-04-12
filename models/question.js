const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const autoIncrement = require("mongoose-auto-increment");

const QuestionSchema = new mongoose.Schema({
	name: {
		type: String,
	},
	email: {
		type: String,
	},
	// question: [{
	// 	type: String,
	// }],
	question: {
		type: String,
	},
	answer:{
		type: String,
		// default: 'No Answer'
	},
	teacher_name:{
		type:String,
	},
	skip:{
		type: Boolean, 
		
	}
});

autoIncrement.initialize(mongoose.connection);
QuestionSchema.plugin(autoIncrement.plugin, {
  model: "Questions", // collection or table name in which you want to apply auto increment
  field: "_id", // field of model which you want to auto increment
  startAt: 1, // start your auto increment value from 1
  incrementBy: 1, // incremented by 1
});

const QuestionChar = new mongoose.model('Questions', QuestionSchema);
module.exports = QuestionChar;



// <% datas.forEach(function(item){ %>
// 	<%= item.question %>
// <%  }) %>