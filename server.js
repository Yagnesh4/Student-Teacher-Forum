/****** Requiring packages ******/

var dotenv = require('dotenv').config();
const Port = process.env.Port;
var express = require('express');
var app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
const alert = require('alert');
/*********************************************************************/


/***************** Requiring Models ******************/
const StudentChar = require('./models/student-register');
const TeacherChar = require('./models/teacher-register');
const QuestionChar = require('./models/question');
const AdminChar = require('./models/admin');
/*******************************************************/


/***************** Requiring Authentication Middleware ******************/
const checkStudent = require('./authMiddleware').checkStudent;
const checkTeacher = require('./authMiddleware').checkTeacher;
const ifNotAuthenticated = require('./authMiddleware').ifNotAuthenticated;
/***************************************************************************/


var bodyparser = require('body-parser');
app.use(express.urlencoded({
    extended: true
}));

app.use(bodyparser.json({limit:'1000mb'}))
var urlencodedParser = bodyparser.urlencoded({extended: false, limit:'1000mb'});
 


/*** setting the view engine and connecting the public folder ***/
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));
/*****************************************************/


/********* Requiring and setting the Passport *********/
const pass_student = require('./student_passport');
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
/*************************************************************/



/***** making the user global ******/
app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});
/************************************/


/******* Setting up Mongodb connection ******/
mongoose.connect(process.env.DB_link, {useNewUrlParser: true}, { useUnifiedTopology: true }, { useFindAndModify: false } );
mongoose.set('useFindAndModify', false);
mongoose.connection.once('open', function(){
	console.log('connection has been made !!');
}).on('error', function(error){
	console.log('error is: ', error);
});
/***********************************************/



/************************** GET Method ******************************/
app.get('/', checkStudent,checkTeacher, function(req,res){
	res.header('Cache-Control', 'no-cache');
	res.header('Expires', 'Fri, 31 Dec 1998 12:00:00 GMT');
    res.render('index');
})
app.get('/index',checkStudent,checkTeacher, function(req,res){
	res.header('Cache-Control', 'no-cache');
	res.header('Expires', 'Fri, 31 Dec 1998 12:00:00 GMT');
    res.render('index');
})

app.get('/about-us',checkTeacher,checkStudent, function(req,res){
	res.render('about-us');
})
/****************************************************************************/


/*************************** Get Method Student Page *******************************/
app.get('/student-register',checkStudent,checkTeacher, function(req,res){
    res.render('student-register');
})
app.get('/student-login',checkStudent,checkTeacher, function(req,res){
	res.render('student-login');
})
app.get('/index-afterlogin',checkTeacher,ifNotAuthenticated, function(req,res){
	res.render('index-afterlogin', {name: req.user.name});
});
app.get('/aboutus-student', checkTeacher,ifNotAuthenticated, function(req,res){
	if(req.isAuthenticated()){
		res.render('aboutus-student',{name:req.user.name})
	}
})
app.get('/question',checkTeacher,ifNotAuthenticated, function(req,res){
	QuestionChar.find({email: req.user.email}, function(err,data){
   	if(err){throw err}
  	else{
	   res.render('question', {name: req.user.name,data:data[j]});
		}
	})
});
app.get('/view-qa', checkTeacher,ifNotAuthenticated, function(req,res){
	QuestionChar.find({email:req.user.email},function(err,data){
		if(!data[j]){
			res.redirect('/question')
		}
		else{
			res.render('view-qa',{name:req.user.name, data:data[j]})
			j++
			if(j==data.length){
				j=0;
			}
		}
	})
	
})

/**********************************************************************************/


/*************************  Post Method Student Page****************************************/
app.post('/student-register', urlencodedParser,	 [
	check('name', ['Username should be 3+ long'])
		.exists()
		.trim()
		.isLength({min: 3}),
	check('email', 'Email is not valid')
		.trim()
        .isEmail()
        .normalizeEmail(),
    check('age', 'Age should not be more than 2 digits')
    	.isNumeric()
    	.trim()
		.exists()
		.isLength({max: 2}),
	check('number', 'Invalid contact number')
		.isNumeric()
    	.trim()
		.isLength({min: 10, max: 10})
		.exists(),
	check('password', 'Password should be more than 5 digits ')
		.trim()
		.exists()
		.isLength({min: 5}),
    check('gender', 'Enter gender either M or F')
	 	.isIn(['M','F','m','f'])
		.isLength({min: 1, max: 1})
		.trim()
		.exists(),

	], async function(req,res){
        
        const errors = validationResult(req);
    	if(!errors.isEmpty()) {
        	const alert = errors.array()
        	res.render('student-register', {
            	alert
        	});
    	}
    	try{
				var details = new StudentChar({
					name: req.body.name,
					gender: req.body.gender,
					age: req.body.age,
					email: req.body.email,
					number: req.body.number,			
					password : req.body.password
				});

				if (errors.isEmpty()) {
					const registered = await details.save();
					console.log('Successfully saved to database ');
					res.render('student-login');							
				}
			}catch(error){
				res.status(400).send('Invalid details please try again!! ' + error);
				console.log('Invalid details please try again!! ' + error);
			}
});
app.post('/student-login',  passport.authenticate('student', {
	failureRedirect: '/student-login',
	failureFlash: true
  }), function(req,res){
	  res.redirect('/index-afterlogin');
	  
  });
  app.post('/question',  urlencodedParser,  async function(req,res){
	  
	var details = new QuestionChar({
		name: req.user.name,
		email: req.user.email,
		question: req.body.question,
		
	});
	const registered = await details.save();

	console.log('questions successfully saved to database.');
	QuestionChar.find({email: req.user.email}, function(err,data){
		if(err){throw err}
		else{
			res.render('question', {name: req.user.name, data: data});	
		}
	 })
});

/**********************************************************************************/

/**************************  Get Method Teacher Page*************************/
app.get('/teacher-register',checkStudent,checkTeacher, function(req,res){
    res.render('teacher-register');
})
app.get('/teacher-login',checkStudent,checkTeacher, function(req,res){
    res.render('teacher-login');
})
app.get('/teacher-afterlogin',checkStudent,ifNotAuthenticated, function(req,res){
	res.render('teacher-afterlogin',{name: req.user.name});
});
app.get('/aboutus-teacher',checkStudent,ifNotAuthenticated, function(req,res){
	if(req.isAuthenticated()){
		res.render('aboutus-teacher', {name: req.user.name});
	}
})

var j=0; 
var i=0;
app.get('/answerPage',checkStudent,ifNotAuthenticated,  function(req,res){
   QuestionChar.find({}, function(err,data){
	  if(req.isAuthenticated()){
		  res.render('answerPage', {name: req.user.name, data: data[j]})
		  i=j++;
		  if(j>=data.length){
			  j=0;  
		  }
	  }
	})
})

var x=0;
app.get('/view-answer',checkStudent,ifNotAuthenticated, function(req,res){
	
		QuestionChar.find({teacher_name:req.user.name},function(err,data){
			try{
			
				console.log(data[x].teacher_name)
				res.render('view-answer',{name:req.user.name, data:data[x]})
				x++
				if(x==data.length){
					x=0;
				}
			
		
	}catch(e){
		res.redirect('/teacher-afterlogin')
	}
})	
})
/**********************************************************************************/


/***************************** Post Method Teacher Page ********************************/
app.post('/teacher-register', urlencodedParser,	 [
	check('name', ['Username should be 3+ long'])
		.exists()
		.trim()
		.isLength({min: 3}),
	check('email', 'Email is not valid')
		.trim()
        .isEmail()
        .normalizeEmail(),
    check('age', 'Age should not be more than 2 digits')
    	.isNumeric()
    	.trim()
		.exists()
		.isLength({max: 2}),
	check('number', 'Invalid contact number')
		.isNumeric()
    	.trim()
		.isLength({min: 10, max: 10})
		.exists(),
	check('password', 'Password should be more than 5 digits ')
		.trim()
		.exists()
		.isLength({min: 5}),
    check('gender', 'Enter gender either M or F')
	 	.isIn(['M','F','m','f'])
		.isLength({min: 1, max: 1})
		.trim()
		.exists(),

	], async function(req,res){
        const errors = validationResult(req);
    	if(!errors.isEmpty()) {
        	const alert = errors.array()
        	res.render('teacher-register', {
            	alert
        	});
    	}
    	try{
			var details = new TeacherChar({
					name: req.body.name,
					gender: req.body.gender,
					age: req.body.age,
					email: req.body.email,
					number: req.body.number,			
					password : req.body.password
				});

				if (errors.isEmpty()) {
					const registered = await details.save();
					console.log('Successfully saved to database ');
					res.render('teacher-login');			
				}
			}catch(error){
				res.status(400).send('Invalid details please try again!! ' + error);
				console.log('Invalid details please try again!! ' + error);
			}
});
app.post('/teacher-login',  passport.authenticate('teacher',{
	failureRedirect: '/teacher-login',
	failureFlash: true
  }), function(req,res){
	  res.redirect('/teacher-afterlogin');
	  console.log(req.user.name);
	
  });

  app.post('/answerPage',  urlencodedParser,  async function(req,res){
	await QuestionChar.find({}, async function(err,data){
		 await QuestionChar.findOneAndUpdate({question:data[i].question}, {'$set': {'answer': req.body.answer, 'teacher_name': req.user.name}}).exec(function(err){
				if (err) {
					throw err
				}else{
					console.log('answer successfully saved to database.');
					res.render('teacher-afterlogin',{name:req.user.name})
				}
		})	
	})	
});

app.post('/skip', async function(req,res){
	await QuestionChar.find({},  function(err,data){	
		QuestionChar.findOneAndUpdate({question:data[i].question}, {'$set': {'skip': true}}).exec(function(err){
				if (err) {
				   throw err
			   }else{
				   res.redirect('/answerPage')
				   }
		})	
   })	
})

/**********************************************************************************/


/********** Logging Out *********/

app.delete('/logout', (req, res) => {
	req.logOut()
	res.redirect('/index');
  });

	// Logout
	app.get('/admin-logout', (req, res) => {

	    req.logout();
	    req.flash('success_msg', 'You are logged out');
	    client.close();
	    res.redirect('/admin-login');

	});
/******************************************/


app.get('/admin-login',checkNotAuthenticatedAdmin, function(req,res){
    res.render('admin-login');
})

app.post('/admin-login',  passport.authenticate('admin',{
	failureRedirect: '/admin-login',
	failureFlash: true
  }), function(req,res){
	  res.redirect('/admin');
	  console.log(req.user.name);
  });

 function checkNotAuthenticatedAdmin(req, res, next) {
	if (req.isAuthenticated()) {
	  return res.redirect('/admin');
	}
	next()
}



app.listen(Port, function(){
    console.log("Server is running on port 3000");
})


