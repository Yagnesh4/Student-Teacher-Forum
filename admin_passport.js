const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passport = require('passport');

const AdminChar = require('./models/admin');



passport.use('admin', new LocalStrategy({ usernameField: 'email' }, (email,password,done)=>{
  const user = AdminChar.findOne({email:email}).then(async(user)=>{
    if (user==null) {
      return done(null,false,{message: 'wrong email entered by admin'});
    }
    try{
      if (await bcrypt.compare(password, user.password)) {
        return done(null,user);
      }else{
        return done(null,false,{message: 'wrong password entered by admin'});
      }
    }catch(e){
      return done(e);
    }
  });
}));

// in model add a property role with defaukt value as student and teacher.

passport.serializeUser((user, done) => {
  done(null, { _id: user.id, role: user.role });
});

passport.deserializeUser((login, done) => {
  if (login.role === 'admin') {
    AdminChar.findById(login, (err, ad) => {
        if (ad)
            done(null, ad);
        else
            done(err, { message: 'Admin not found' })
    });
}
  else {
      done({ message: 'No entity found' }, null);
  }
});


// https://stackoverflow.com/questions/20052617/use-multiple-local-strategies-in-passportjs