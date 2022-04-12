module.exports.checkStudent =  function (req,res,next){
    if (req.isAuthenticated()) {
		
        if(req.user.role === 'student'){
            console.log(req.user.email + ' from student ' + true)
            return res.redirect('/index-afterlogin');
        }
        // else {
        //    res.status(200).send('Invalid Page');
        // }
        
}
next()
}

module.exports.checkTeacher = function(req,res,next){
    if (req.isAuthenticated()) {
		
        if(req.user.role === 'teacher'){
            console.log(req.user.email + ' from teacher ' + true)
            return res.redirect('/teacher-afterlogin');
        }
       
}
next()
}

module.exports.ifNotAuthenticated = function(req, res, next) {
	if (req.isAuthenticated()) {
	  return next()
	}
  
	res.redirect('/')
  }

