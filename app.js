var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var webRouter = require('./routes/web/endpoint');
var appRouter = require('./routes/app/api');
var session = require('express-session');
require('dotenv').config();
// const passport = require('passport');
// var flush = require('connect-flash');
var databaseConnection = require('./database/mongo');
const usersModel = require('./models/users');
const _helper = require('./Helpers/helpers');

var app = express();
//Passport config

addseeders();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:'secret',
  // cookie:{
  //   maxAge:60000  
  // },
  resave:false,
  saveUninitialized:false
}));

//Passport middleware
// app.use(passport.initialize());
// app.use(passport.session());

// require('./Helpers/Utilities/partnerPassport')(passport);

//Flash message middleware

app.use((req,res,next)=>{
  res.locals.message = req.session.message
  delete req.session.message
  next()
})

app.use('/', webRouter);
app.use('/app', appRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


async function addseeders(){
  const hash =  await _helper.utility.common.encryptPassword(10,'123456')
  let findAdmin =  await usersModel.findOne({"email":"super@user.in", userType:1,is_Active:true});
  if(!findAdmin){
    try{
      let payload = {
        name: "Admin",
        ph_no : "123456",
        email : "super@user.in",
        userType : 1,
        password : hash
      }
      let model = new usersModel(payload);
      let svaedAdmin =  await model.save();
      console.log("Super admin ",svaedAdmin);
    }catch(err){
      console.log("Couldn't save super admin")
      console.log("Error ",err);
    }
  }
}
module.exports = app;
