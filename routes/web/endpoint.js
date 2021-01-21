var express = require('express');
var router = express.Router();
const partnerRouter = require('./partner');
const busRouter = require('./buses');
const userRouter = require('./users');
const jwt = require('jsonwebtoken');
const config = require('config');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/about', function(req, res, next) {
    res.render('about');
});

router.get('/faq', function(req, res, next) {
    res.render('faq');
});

router.get('/partner', function(req, res, next) {
    res.render('partner');
});

router.get('/user-login', function(req, res, next) {
    res.render('login');
});

router.get('/user-otp-submit',function(req,res,next){
    res.render('otp_submit');
})

router.get('/account', function(req, res, next) {
    res.render('account');
});

router.get('/booking-history', function(req, res, next) {
    res.render('booking_history');
});

router.get('/contact', function(req, res, next) {
    res.render('contact');
});

router.get('/search-result', function(req, res, next) {
    res.render('search_results');
});

// router.get('/search-result', function(req, res, next) {
//     res.render('search_results');
// });

router.get('/partner-login', function(req, res, next) {
    res.render('partner_login');
});

router.get('/partner-dashboard', function(req, res, next) {
    // jwt.verify(token,config.get('partnertokenSecret'), (err,user) => {
    //     if (err) return res.sendStatus(403)
    //     console.log("user ",user);
    //     req.user = user;
    //   })
      res.render('partner_dashboard');
});

router.use('/partnerRouter', partnerRouter);
router.use('/busRouter',busRouter);
router.use('/users',userRouter);


module.exports = router;