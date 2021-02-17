var express = require('express');
var router = express.Router();
const partnerRouter = require('./partner');
const busRouter = require('./buses');
const userRouter = require('./users');
const middleware = require('../../middleware/middleware');
const controller = require('../../controller/buses');
const _helper = require('../../Helpers/helpers');
const usersModel = require('../../models/users');
const enduserModel = require('../../models/endusers');
const busModel = require('../../models/buses');
const bookingModel = require('../../models/bookings');
const session = require('express-session');


/* GET home page. */
router.get('/', async function(req, res, next) {
    const localationList = await _helper.utility.buses.fetchLocationList();
    console.log("localationList ",{"localationList":localationList});
    res.render('index',{"localationList":localationList});
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

router.get('/admin', async function(req, res, next) {
    if(req.session.admin){
        try{
            const toatalPartner = await usersModel.find({userType:2});
            const totalUser = await enduserModel.find({is_Active:true});
            const toatalBuses = await busModel.find({is_active:true});
            const totalBookings = await bookingModel.find({});
            res.render('admin/index',{"partners":toatalPartner,"toatalPartner":toatalPartner.length,
                            "totalUser":totalUser.length,"toatalBuses":toatalBuses.length,"totalBookings":totalBookings.length});
        }catch(err){
            console.log("Admin error ",err);
            res.render('admin/page-login');
        }
    }else{
        res.render('admin/page-login');
    }
});

router.get('/admin-login', function(req, res, next) {
    res.render('admin/page-login');
});

router.post('/admin-login', async function(req, res, next) {
    const {email,password} = req.body;
    let response = {
        status:false,
        message : "",
        payload:{}
    }
    if(!email || !password || email == "" || password == ""){
        response.message = "Please fill all the fields with valid credentials";
        res.send(response);
    }
    try{
        // console.log("partnerCredentials ",partnerCredentials);
        let findAdmin = await usersModel.findOne({"email":email,is_Active:true,userType:1});
        console.log("findAdmin ",findAdmin);
        if(!findAdmin){
            response.message = "Unauthorised credentials";
            res.send(response);
        }
        let adminPassword = findAdmin.password;
        const isValidPassword = await _helper.utility.common.checkPassword(password,adminPassword)
        console.log("isValidPassword ",isValidPassword);
        if(!isValidPassword){
            response.message = "Unauthorised credentials";
            res.send(response);
        }
        req.session.admin = findAdmin;
        response.status = true;
        response.message = "password matched successfully";
        response.payload = findAdmin;
        let token = jwt.sign({'partnerInfo':response.payload},config.get('LogintokenSecret'));
        response.payload = token;
        res.send(response);
    }catch(err){
        response.message = err.message;
        res.send(response);
    }
});

router.get('/user-login', function(req, res, next) {
    res.render('login');
});

router.get('/user-otp-submit/:id', async function(req,res,next){
    res.render('otp_submit',{ "id": req.params.id});
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

router.get('/search-result/:p', async function(req, res, next) {
    let queryvalue = req.query;
    let queryString= "?";
        // return Promise((resolve,reject) =>{
            try{
                    const localationList = await _helper.utility.buses.fetchLocationList();
                    console.log("req.query.d_d ",req.query.d_d);
                    console.log("Location list ",localationList);
                    if(req.query.d_d == "" || req.query.d_d == null || req.query.d_d == undefined){
                        console.log("Its comming here");
                        req.session.message = {
                            type:'danger',
                            intro:'Please select departure date !! ',
                        }
                        return res.redirect('/')
                    }
                    if(req.query.p_l == "" || req.query.p_l == null){
                       return res.render('index',{message:{type:'danger',info:"Please select Pickup location"},"localationList":localationList})
                    }
                    if(req.query.d_l == "" || req.query.d_l == null){
                       return res.render('index',{message:{type:'danger',info:"Please select drop location",message:""},"localationList":localationList})
                    }
                    queryString += "d_d=" + req.query.d_d +"&p_l="+ req.query.p_l + "&d_l="+ req.query.d_l;
                    if(req.query.r_p == "return"){
                        if(req.query.d_d2 == ""){
                            return res.render('index',{message:{type:'danger',info:"Please select return departure date"},"localationList":localationList})
                        }
                        if(req.query.p_l2 == ""){
                            return res.render('index',{message:{type:'danger',info:"Please select return Pickup location"},"localationList":localationList})
                        }
                        if(req.query.d_l2 == ""){
                            return res.render('index',{message:{type:'danger',info:"Please select drop return location",message:""},"localationList":localationList})
                        }
                        queryString += "d_d2=" + req.query.d_d2 +"&p_l2="+ req.query.p_l2 + "&d_l2="+ req.query.d_l2;
                    }
                    queryString += req.query.d_t ? "&d_t = "+ req.query.d_t : "";
                    queryString += req.query.d_t2 ? "&d_t2 = "+ req.query.d_t2 : "";
                    queryString += req.query.a_c ? "&a_c = "+ req.query.a_c : " ";
            
                    const page = req.params.p;
                    const payload = {
                        departureDate: req.query.d_d,
                        departureTime : req.query.d_t ? req.query.d_t : "",
                        pickupLocation : req.query.p_l,
                        dropLocation : req.query.d_l,
                        returnProcess : req.query.r_p ? req.query.r_p : "" ,
                        acType: req.query.a_c ? req.query.a_c : "",
                        returnDepartureDate : req.query.d_d2 ? req.query.d_d2 : "",
                        returnDepartureTime : req.query.d_t2 ? req.query.d_t2 : "",
                        returnPickupLocation : req.query.p_l2 ? req.query.p_l2 : "",
                        returnDropLocation : req.query.d_l2 ?  req.query.d_l2 : ""
                    }
                    console.log("Payload is here ",payload);
                    const findTransfer = await controller.findAtransfer(page,payload);
                    if(findTransfer.status == false){
                        return res.render('index',{message:{type:'danger',info:"Error Occur",message:findTransfer.message}})
                    }else if(findTransfer.status == true){
                        console.log("findTransfer ",findTransfer);
                        console.log("queryvalue ",queryvalue);
                        return res.render('search_result',{"findTransfer":findTransfer,"redirectUrl":queryString,"localationList":localationList,"queryvalue":queryvalue});
                    }
            }catch(err){
                console.log("err ",err);
                return res.render('index',{message:{type:'danger',info:"Errror occur!!",message:"Errror occur!! white fetching bus list!!! Please try again"}})
            }
        // })
    
});

router.get('/seat-booking',async function(req,res){
    console.log("Bus id ",req.query.busid);
    
    res.render('seat-booking/seat-arangment',{busid:req.query.busid});
})

// router.get('/search-result', function(req, res, next) {
//     res.render('search_results');
// });

router.get('/partner-login', function(req, res, next) {
    res.render('partner_login');
});

router.get('/partner-dashboard', function(req, res, next) {
    // jwt.verify(token,config.get('LogintokenSecret'), (err,user) => {
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