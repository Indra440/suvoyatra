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
const mongoose = require('mongoose');
const userController = require('../../controller/users');


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


// From here all admin routes start
router.get('/admin', async function(req, res, next) {
    if(req.session.admin){
        try{
            const toatalPartner = await usersModel.find({userType:2,is_Active:true});
            const totalUser = await enduserModel.find({is_active:true});
            const toatalBuses = await busModel.find({is_active:true});
            const totalBookings = await bookingModel.find({});
            const recentPartnerRequest = await usersModel.find({userType:2,is_Active:false,verficationstatus:"pending"});
            res.render('admin/index',{"partnerRequest":recentPartnerRequest,"toatalPartner":toatalPartner.length,
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

router.get('/table-data', function(req, res, next) {
    res.render('admin/tables-data');
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

router.post('/actionForPartner',async function(req,res){
    if(req.session.admin){
        try{
            let partnerId = req.body.partnerId;
            let action = req.body.action;
            let findPartner = await usersModel.findOne({_id:mongoose.Types.ObjectId(String(partnerId))});
            if(!findPartner){
                return res.status(500).send({status:false,login:true,message:"Partner not found"})
            }
            
            findPartner.is_Active = action == true ? true : false,
            findPartner.verficationstatus = action == true ? "approved" : "rejected";
            await findPartner.save();
            return res.status(200).send({status:true,login:true,message:"Partner "+findPartner.verficationstatus+" successfully"})
        }catch(err){
            console.log("Admin error ",err);
            return res.status(500).send({status:false,login:true,message:err.message})
        }
    }else{
        return res.status(500).send({status:false,login:false,message:"You have loggedout from this session please login again"})
    }
})


//End all Admin routes

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
    let queryvalue = req.query;
    console.log("queryvalue ",queryvalue);
    const bookingDetails = await busModel.aggregate([
        {
            $match:{
                _id:mongoose.Types.ObjectId(String(queryvalue.b)),
                is_active : true
            }
        },
        {
            $lookup:{
                from: "bookings",
                localField : "_id",
                foreignField: "busId",
                as: "bookingDetails"
            }
        },
        {
            $project:{
                _id:1,
                totalseat : "$busFeature.noOfSeat",
                seatTemplate : "$seatTemplate",
                bookingDetails : {
                    $filter:{
                        input: "$bookingDetails",
                        as: "booking",
                        cond: { $eq: [ "$$booking.bookingFor", new Date(queryvalue.d_d) ] }
                    }
                }
            }
        },
        {
            $project:{
                    _id:1,
                    totalseat : 1,
                    seatTemplate :1,
                    bookedSeat:{
                            $cond:{if:{$gte:[{$size:"$bookingDetails"},1]},
                                        then:{ $map:{ input: "$bookingDetails", as: "booking", in:{$sum: "$$booking.bookingSeatNo" }}},else:[]}
                        }
                }
        }
    ])
    console.log("bookingDetails ",bookingDetails);
    res.render('seat-booking/seat-arangment',{bookingDetails:bookingDetails,"queryvalue":queryvalue});
})


router.get('/add-passenger-details',
    async function(req, res) {
        console.log("Query ",req.query);
        let queryvalue = req.query;
        if(!req.query.t || req.query.t == null || req.query.t == ""){
            res.render('login');
        }
        const checkActive =  await userController.checkActiveUser(req.query.t);
        if(checkActive.status == false){
            res.render('login');
        }
        const userDetails = {
            userEmail : checkActive.payload.userEmail && checkActive.payload.userEmail !== null ? checkActive.payload.userEmail : "",
            userMobile : checkActive.payload.user_Ph_Number && checkActive.payload.user_Ph_Number !== null ? checkActive.payload.user_Ph_Number : ""
        }
        delete queryvalue["t"];
        // console.log("checkActive ",checkActive);
        // console.log("userDetails ",checkActive);
        // console.log("Final query ",queryvalue);
        // console.log("Seats ",JSON.parse(req.query.seats));
        const fetchBus = await busModel.findOne({_id:mongoose.Types.ObjectId(String(req.query.b)),is_active:true});
        if(!fetchBus){
            res.redirect('/');
        }
        queryvalue.d_t = queryvalue.d_t ? queryvalue.d_t : fetchBus.busTiming.departureTime;
        queryvalue.b_n = queryvalue.b_n ? queryvalue.b_n : fetchBus.busName;
        queryvalue.b_id = queryvalue.b_id ? queryvalue.b_id : fetchBus._id;
        console.log("Final query value ",queryvalue);   
        res.render('passenger_details',{"queryvalue":queryvalue,"userDetails":userDetails});
});

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