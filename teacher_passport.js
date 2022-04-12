const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passport = require('passport');
const StudentChar = require('./models/student-register');
const TeacherChar = require('./models/teacher-register');

passport.use('teacher', new LocalStrategy({ usernameField: 'email' }, (email,password,done)=>{
  const user = TeacherChar.findOne({email:email}).then(async(user)=>{
    if (user==null) {
      return done(null,false,{message: 'wrong email entered by teacher'});
    }
    try{
      if (await bcrypt.compare(password, user.password)) {
        return done(null,user);
      }else{
        return done(null,false,{message: 'wrong password entered by teacher'});
      }
    }catch(e){
      return done(e);
    }
  });
}));

passport.serializeUser((user, done)=> { return done(null, user.id)})
passport.deserializeUser((id, done)=> {
  const fetchuser =(id)=>TeacherChar.findById(id);
  fetchuser(id).then((user)=>{
    return done(null, user); 
  });
   
});



