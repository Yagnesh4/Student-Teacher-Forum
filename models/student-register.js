const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const StudentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'First name required'],
		minlength:[3,'Minimun length should be 3 characters']
	},
	
	gender:{
		type: String, 
		required: [true, 'Gender is required']
	},
	age: {
		type: Number,
		required: [true, 'Age is required'],
		maxlength: [2,'Maximum length is 2 digits']
	},
    email: {
		type: String,
		required: [true,'Email is required']
	},
	number: {
		type: Number,
		required: [true,'Contact number is required'],
		
	},
	password: {
		type: String,
		required:true
	},
	role:{
		type: String,
		default: 'student' //Manage respectively
		},
	accept:{
		type: Boolean, 
		default: false
	},	

});

// RegisterSchema.methods.generateAuthToken = async function(){
// 	try{
// 		console.log('Currently registered id ' + this._id);
// 		const gtoken = jwt.sign({_id:this._id.toString()}, 'mynameisyagneshnarayananengineeringstudentcomps');
// 		this.tokens = this.tokens.concat({token:gtoken});
// 		await this.save();
// 		return gtoken;
// 	}catch(error){
// 		// res.send('Error part ' + error);
// 		console.log('Error part ' + error);
// 	}
// }

StudentSchema.pre("save", async function(next){
	
	if (this.isModified('password')) {
		console.log('the password before hash ' + this.password);
		this.password = await bcrypt.hash(this.password, 10);
		console.log('the password after hash' + this.password);	
	}
	
	next();
});

const StudentChar = new mongoose.model('Student_Registration', StudentSchema);
module.exports = StudentChar;