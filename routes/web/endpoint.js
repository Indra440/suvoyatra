var express = require('express');
var router = express.Router();
const partnerRouter = require('./partner');
const busRouter = require('./buses');
const userRouter = require('./users');
const bususerRouter = require('./bususer');
const middleware = require('../../middleware/middleware');
const controller = require('../../controller/buses');
const _helper = require('../../Helpers/helpers');
const session = require('express-session');
const mongoose = require('mongoose');
const moment = require('moment');
const config = require('config');
const jwt = require('jsonwebtoken');
const usersModel = require('../../models/users');
const enduserModel = require('../../models/endusers');
const busModel = require('../../models/buses');
const bookingModel = require('../../models/bookings');
const queryModel = require('../../models/queries');
const userController = require('../../controller/users');
const {nanoid}  = require("nanoid");


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

router.get('/forget-pass',function(req,res,next){
    res.render('forget-pass');
})

router.get('/blog',function(req,res,next){
    res.render('blog')
})


// From here all admin routes start **********************************************************************************************************
router.get('/admin', async function(req, res, next) {
    if(req.session.admin){
        try{
            const toatalPartner = await usersModel.find({userType:2,is_Active:true});
            const totalUser = await enduserModel.find({is_active:true});
            const toatalBuses = await busModel.find({is_active:true});
            const totalBookings = await bookingModel.find({});
            const recentPartnerRequest = await usersModel.find({userType:2,is_Active:false,verficationstatus:"pending"});
            const fetchallQueries = await queryModel.find({queryStatus:"pending"});
            console.log("fetchallQueries ",fetchallQueries);
            res.render('admin/index',{"queries":fetchallQueries,"partnerRequest":recentPartnerRequest,"toatalPartner":toatalPartner.length,
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
            // console.log("Action is here ",action);
            // console.log("Action type ",typeof(action));
            findPartner.is_Active = (action == "true") ? true : false,
            findPartner.verficationstatus = (action == "true") ? "approved" : "rejected";
            await findPartner.save();
            let message = (action == "true") ? 
                            "Hey  "+ findPartner.name + " your Suvoyatra account verified successfully!!!. <br><br><br> Thank you for join with Suvoyatra." 
                            : "Hey  "+ findPartner.name + " sorry to inform you that your Suvoyatra account verfication got rejected!!!. <br><br><br> Please contact our admin for more info." ;
            let EmailDetails = {
                to:findPartner.email,
                subject : "Suvoyatra partner verification",
                message : message
            }
            const sendMail = await _helper.utility.common.sendMail(EmailDetails);
            console.log("sendMail ",sendMail);
            if(sendMail != true){
                return res.status(200).send({status:true,login:true,message:"Action performed but couldn't send mail"})
            }
            return res.status(200).send({status:true,login:true,message:"Partner "+findPartner.verficationstatus+" successfully"})
        }catch(err){
            console.log("Admin error ",err);
            return res.status(500).send({status:false,login:true,message:err.message})
        }
    }else{
        return res.status(500).send({status:false,login:false,message:"You have loggedout from this session please login again"})
    }
})

router.post('/resolveQuery',async function(req,res){
    if(req.session.admin){
        try{
            let queryId = req.body.queryId;
            let findQuery = await queryModel.findOne({_id:mongoose.Types.ObjectId(queryId),queryStatus:"pending"});
            if(!findQuery){
                return res.status(500).send({status:false,login:true,message:"Query not found or it's already resolved"})
            }
            findQuery.queryStatus = "resolved";
            await findQuery.save();
            return res.status(200).send({status:true,login:true,message:"Query resolved"})
        }catch(err){
            console.log("Admin error ",err);
            return res.status(500).send({status:false,login:true,message:err.message})
        }
    }else{
        return res.status(500).send({status:false,login:false,message:"You have loggedout from this session please login again"})
    }
})

router.get('/allpartners',async function(req,res){
    if(req.session.admin){
        try{
            let fetchAllPartners =  await usersModel.aggregate([
                {
                    $match:{
                        userType: "2"
                    }
                },
                {
                    $project:{
                        _id:1,
                        name : 1,
                        email : 1,
                        ph_no : 1,
                        city : 1,
                        zipCode : 1,
                        is_Active : 1,
                        verficationstatus:1
                    }
                }
            ]);
            if(!fetchAllPartners){
                return res.render('admin/all-parners',{partners:[]});
            }
            console.log("fetchAllPartners ",fetchAllPartners);
            return res.render('admin/all-partners',{partners:fetchAllPartners});
        }catch(err){
            console.log("Admin error ",err);
            return res.render('admin/all-partners',{partners:[]});
        }
    }else{
        return res.render('admin/page-login');
    }
})

router.post('/accessPartnerDashboard',async function(req,res){
    if(req.session.admin){
        try{
            const  partnerId = req.body.partner_id;
            const findPartner = await usersModel.findOne({_id:mongoose.Types.ObjectId(partnerId),userType:"2",is_Active :true })
            if(!findPartner){
                return res.status(500).send({status:false,login:true,message:"Partner not found or its not active now"})
            }
            const token = jwt.sign({'partnerInfo':findPartner},config.get('LogintokenSecret'));
            return res.status(200).send({status:true,login:true,message:"Dashboard access successfully",token:token})
        }catch(err){
            console.log("Admin error ",err);
            return res.status(500).send({status:false,login:true,message:err.message})
        }
    }else{
        return res.status(500).send({status:false,login:false,message:"You have loggedout from this session please login again"})
    }
})

router.post('/active-deactive-partner',async function(req,res){
    if(req.session.admin){
        try{
            const  partnerId = String(req.body.partner_id);
            const action = req.body.action;
            console.log("action ", action);
            const final_action = (action == "true") ? false : true;
            console.log("final_action ",final_action);
            const findPartner = await usersModel.findOne({_id:mongoose.Types.ObjectId(partnerId),userType:"2",is_Active : final_action})
            let msg = (action == "true") ? "activated" : "de-activated";
            console.log("findPartner ",findPartner);
            if(!findPartner){
                return res.status(500).send({status:false,login:true,message:"Partner not found or its already  "+ msg})
            }
            findPartner.is_Active = action;
            await findPartner.save();
            return res.status(200).send({status:true,login:true,message:"Partner successfully  "+msg})
        }catch(err){
            console.log("Admin error ",err);
            return res.status(500).send({status:false,login:true,message:err.message})
        }
    }else{
        return res.status(500).send({status:false,login:false,message:"You have loggedout from this session please login again"})
    }
})






router.get('/allusers',async function(req,res){
    if(req.session.admin){
        try{
            let fetchAllUsers =  await enduserModel.aggregate([
                // {
                //     $match:{
                //         is_active:true
                //     }
                // },
                {
                    $project:{
                        _id:1,
                        userName : 1,
                        userEmail : 1,
                        user_Ph_Number : 1,
                        city : 1,
                        zipCode : 1,
                        is_active : 1,
                        Verification : 1 
                    }
                }
            ]);
            if(!fetchAllUsers){
                return res.render('admin/all-users',{users:[]});
            }
            return res.render('admin/all-users',{users:fetchAllUsers});
        }catch(err){
            console.log("Admin error ",err);
            return res.render('admin/all-users',{users:[]});
        }
    }else{
        return res.render('admin/page-login');
    }
})

router.post('/active-deactive-user',async function(req,res){
    if(req.session.admin){
        try{
            const  userId = String(req.body.user_id);
            const action = req.body.action;
            console.log("action ", action);
            const final_action = (action == "true") ? false : true;
            console.log("final_action ",final_action);
            const findUser = await enduserModel.findOne({_id:mongoose.Types.ObjectId(userId),is_active : final_action})
            let msg = (action == "true") ? "activated" : "de-activated";
            console.log("findUser ",findUser);
            if(!findUser){
                return res.status(500).send({status:false,login:true,message:"user not found or its already  "+ msg})
            }
            findUser.is_active = action;
            await findUser.save();
            return res.status(200).send({status:true,login:true,message:"user successfully  "+msg})
        }catch(err){
            console.log("Admin error ",err);
            return res.status(500).send({status:false,login:true,message:err.message})
        }
    }else{
        return res.status(500).send({status:false,login:false,message:"You have loggedout from this session please login again"})
    }
})

router.get('/allbookings',async function(req,res){
    if(req.session.admin){
        try{
            let fetchAllBookings =  await bookingModel.aggregate([
                {
                    $lookup:{
                        from: "endusers",
                        localField: "userId",
                        foreignField: "_id",
                        as: "enduser_details"
                    }
                },
                {
                    $lookup:{
                        from: "buses",
                        localField: "busId",
                        foreignField: "_id",
                        as: "bus_details"
                    }
                },
                {
                    $unwind:{
                        path:"$enduser_details",
                        preserveNullAndEmptyArrays : true
                    }
                },
                {
                    $unwind:{
                        path:"$bus_details",
                        preserveNullAndEmptyArrays : true
                    }
                },    
                {
                    $project:{
                        _id:1,
                        ticketNo:1,
                        username: "$enduser_details.userName",
                        userEmail : "$enduser_details.userEmail",
                        pickupLocation :1,
                        dropLocation : 1,
                        returnProcess : 1,
                        busname : "$bus_details.busName",
                        partnerId : "$bus_details.partnerId",
                        bookingAmmount : 1,
                        bookingStatus : 1,
                        bookingFor : 1,
                        bookingSeat : 1,
                        passengersDetails : 1,
                        createdAt : 1 
                    }
                }
            ]);
            if(!fetchAllBookings){
                return res.render('admin/all-bookings',{bookings:[]});
            }
            console.log("fetchAllBookings ",fetchAllBookings);
            return res.render('admin/all-bookings',{bookings:fetchAllBookings,moment:moment});
        }catch(err){
            console.log("Admin error ",err);
            return res.render('admin/all-bookings',{bookings:[]});
        }
    }else{
        return res.render('admin/page-login');
    }
})


//End all Admin routes **************************************************************************************************************************************

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
    try{
        let queryvalue = req.query;
        console.log("queryvalue ",queryvalue);
        let bookingDetails = await _helper.utility.buses.fetchBookedSeat(queryvalue.b,queryvalue.d_d);
        if(bookingDetails.status == false){
            return res.redirect('/');
        }
        console.log("bookingDetails ",bookingDetails.bookingDetails);
        return res.render('seat-booking/seat-arangment',{bookingDetails:bookingDetails.bookingDetails,"queryvalue":queryvalue});
    }catch(err){
        return res.redirect('/');
    }
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
        queryvalue.seats = JSON.parse(queryvalue.seats);
        console.log("Final query value ",queryvalue);   
        console.log("userDetails",userDetails);   
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

// router.post('get-app-link',function(req,res,next){
//     try{

//     }catch(e){

//     }
// })

router.use('/partnerRouter', partnerRouter);
router.post('/forgot-password',async function(req,res){
    try{
        let findPartner = await usersModel.findOne({$or:[{"email":req.body.username},{"ph_no":req.body.username}],is_Active:true,userType:2});
        if(!findPartner){
            return res.status(500).send({status:false,message:"User not found"});
        }
        let passwordResetId = nanoid(8).toUpperCase();
        findPartner.resetPasswordLink = passwordResetId;
        await findPartner.save();
        const basicUrl = config.get('basicUrl');
        let message = "<p>To Reset your password <a href='"+basicUrl+"/reset-password?rpc="+passwordResetId+"'> Click </a> here</p>";
        let EmailDetails = {
            to:findPartner.email,
            subject : "Reset password",
            message : message
        }
        const sendMail = await _helper.utility.common.sendMail(EmailDetails);
        console.log("sendMail ",sendMail);
        if(sendMail != true){
            return res.status(200).send({status:false,message:"Not able to send mail.Please try again"})
        }
        res.status(200).send({status:true,message:"We have sent you a reset password link in your registered Email"});
    }catch(error){
        console.log("Error is here ",error.message);
        return res.status(500).send({status:false,message:"Something went wrong. please try again"});
    }
})

router.get('/reset-password',function(res,res,next){
    res.render('reset-password')
})

router.post('/reset-password',async function(req,res,next){
    try{
        const rpc = req.body.rpc;
        const newPass = req.body.newPass;
        const confirmPass = req.body.confirmPass;
        if(!rpc || rpc == null || rpc== undefined || rpc == ""){
            return res.status(500).send({status:false,message:"You are request is invalid"});
        }
        if(!newPass || newPass == null || newPass == undefined ||newPass=="" || 
                        !confirmPass || confirmPass == null || confirmPass == undefined ||confirmPass==""){
            return res.status(500).send({status:false,message:"New and confirm both password are need to be valid"});
		}
        if(newPass.length < 6){
            return res.status(500).send({status:false,message:"More than 6 character required"});
        }
        if(newPass != confirmPass){
            return res.status(500).send({status:false,message:"New and confirm password are not matched"});
        }
        let findPartner = await usersModel.findOne({resetPasswordLink: String(rpc),is_Active:true,userType:2});
        if(!findPartner){
            return res.status(500).send({status:false,message:"User not found or inactive"});
        }
        const hash =  await _helper.utility.common.encryptPassword(10,String(newPass));
        findPartner.password = hash;
        await findPartner.save();
        return res.status(200).send({status:true,message:"Password reset successfully"});
    }catch(err){
        console.log("Error is here ",err);
        return res.status(500).send({status:false,message:"Something went wrong. please try again"});
    }
})

router.use('/busRouter',busRouter);
router.use('/users',userRouter);
router.get('/fetch-bus-list',async function(req,res){
    try{
        const fetchBuslist = await busModel.aggregate([
            {
                $match:{is_active:true}
            },
            {
                $project:{
                    _id:1,
                    busName : 1
                }
            }
        ])
        if(!fetchBuslist){
            return res.status(500).send({status:false,message:"Not able to fetch bus list please reload again",buslist:[]})
        }
        return res.status(200).send({status:true,login:true,message:"bus list fetched successfully",buslist :fetchBuslist})
    }catch(err){
        return res.status(500).send({status:false,message:"",buslist:[]})
    }
})

router.use('/bususer',bususerRouter)



router.get('/users', function(req, res, next) {
    res.render('bus-user/bus-user-dashboard');
});

router.get('/users-login',function(req,res,next){
    res.render('bus-user/bus-user-login');
})



module.exports = router;