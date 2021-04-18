
const { restart } = require('nodemon');
const _helper = require('../../Helpers/helpers');
const enduserModel = require('../../models/endusers');
const mongoose = require('mongoose');
const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const controller = require('../../controller/users');
const busModel = require("../../models/buses");
const bookingModel = require ("../../models/bookings");

module.exports.validateUser = async (req,res,next) =>{
    try{
        const headerToken = req.get('authorizationToken');
        const checkActive =  await controller.checkActiveUser(headerToken);
        if(checkActive.status == false){
            return res.redirect('/user-login');
        }
        req.user = checkActive.payload;
        next();
    }catch(err){
        return res.redirect('/user-login');
    }    
}


module.exports.userLogin = async (req,res,next) =>{
    console.log("Body ",req.body);
    if(req.body.username =="" || req.body.username == null || req.body.username == undefined){
        res.status(500).send({status:false,message:"Please enter a valid username"});
    }
    let flag;
    if(!_helper.utility.common.validateEmail(req.body.username)){
        _helper.utility.common.validatePhonenumber(req.body.username) == true ? flag = "mobile" :"";
    }else{
        flag = "email";
    }
    if(!flag || flag == null || flag == undefined){
        res.status(500).send({status:false,message:"Please enter a valid mobile no or email"});
    }
    req.flag = flag;
    next()
}

module.exports.userOtpChecking = async (req,res,next) =>{
    console.log("Body ",req.body);
    const {user_id,otp} = req.body;
    if(!user_id || user_id == "" || user_id == undefined){
        return res.status(500).send({status:false,message:"User not found! Plese try again"});
    }
    if(!otp || otp=="" || otp == undefined){
        return res.status(500).send({status:false,message:"Invalid otp"});
    }
    console.log("user_id ",user_id);
    const fetchUser = await enduserModel.findOne({_id:mongoose.Types.ObjectId(user_id),is_active:true});
    console.log("fetchUser ",fetchUser);
    if(!fetchUser){
        return res.status(500).send({status:false,message:"User is not exist"});
    }
    let last_otp = fetchUser.Verification.last_otp;
    if(!last_otp || last_otp == null || last_otp == undefined){
        return res.status(500).send({status:false,message:"Looks like user is not requested for verification yet"});
    }
    if(String(otp) != last_otp){
        return res.status(500).send({status:false,message:"Otp does not matched"});
    }
    if(_helper.utility.common.calulateTime(fetchUser.Verification.otp_generation_time,new Date()) > 10){
        return res.status(500).send({status:false,message:"verification time over! please try again"});
    }
    req.user = fetchUser;
    console.log("its comming  here",req.user);
    next();
}

module.exports.saveUser = async (req,res,next) =>{
    console.log("Body ",req.body);
    if(req.body.email == "" && req.body.phone == ""){
        return res.status(500).send({status:false,message:"Both contact details can't be removed"})
    }
    if((req.body.email != "") && !(emailRegexp.test(req.body.email))){
        return res.status(500).send({status:false,message:"Please check your email"})
    }
    if(req.body.phone != "" && String(req.body.phone).length !=10){
        return res.status(500).send({status:false,message:"Please check Contact number"})
    }
    next()
}

module.exports.bookTicket = async (req,res,next) =>{
    try{
        const {bus_id,bus_name,departure_date,departure_time,pickup_location,drop_location,seats,total_ammount,ticketEmail,ticketmobile_no,passengerDetails} = req.body;
        let seatArray = JSON.parse(seats);
        let passengerArray = JSON.parse(passengerDetails);
        if(!bus_id || bus_id == "" || bus_id == null || bus_id == undefined ||
           !bus_name || bus_name == "" || bus_name == null || bus_name == undefined ||
           !departure_date || departure_date == "" || departure_date == null || departure_date == undefined ||
           !departure_time || departure_time == ""  || departure_time == null || departure_time == undefined ||
           !pickup_location || pickup_location == "" || pickup_location == null || pickup_location == undefined ||
           !drop_location || drop_location == "" || drop_location == null || drop_location == undefined ||
           !total_ammount || total_ammount == "" || total_ammount == null || total_ammount == undefined  
        ){
            return res.status(500).send({status:false,message:" required fields are mandatory"});
        }
        if(ticketEmail == "" && ticketmobile_no == ""){
            return res.status(500).send({status:false,message:"Atleast one contact details is needed to send ticket"});
        }

        if(ticketEmail !=""){
            if(!(emailRegexp.test(ticketEmail))){
                return res.status(500).send({status:false,message:"Please Enter a valid email in contact details"});
            }
        }
        if(ticketmobile_no != ""){
            if(isNaN(ticketmobile_no) ||  String(ticketmobile_no).length != 10){
                return res.status(500).send({status:false,message:"Please Enter a valid 10 digit mobile number in contact details"});
            }
        }

        if(!seatArray || seatArray == null || seatArray == undefined || seatArray.length == 0){
            return res.status(500).send({status:false,message:"Seat selection is mandatory to book a bus"});
        }
        if(!passengerArray || passengerArray == null || passengerArray == undefined || passengerArray.length == 0){
            return res.status(500).send({status:false,message:"Seat selection is mandatory to book a bus"});
        }
        let findBus = await busModel.findOne({_id:mongoose.Types.ObjectId(String(bus_id)),is_active:true});
        if(!findBus){
            return res.status(500).send({status:false,message:"Bus not found or inactive now"});
        }

        let bookingDetails = await _helper.utility.buses.fetchBookedSeat(bus_id,departure_date);
        if(bookingDetails.status == false){
            return res.status(500).send({status:false,message:"Error occur while booking seat"});
        }
        console.log("bookingDetails ",bookingDetails);
        if(JSON.parse(bookingDetails.bookingDetails[0].bookedSeat).length > 0){
            console.log("Inside this");
            let bookedSeats = JSON.parse(bookingDetails.bookingDetails[0].bookedSeat);
            let allbookedSeatNo = [],alreadyBooked = [];
            seatArray.map(e =>{allbookedSeatNo.push(e.seatNo)});
            bookedSeats.map((cur_bookedSeat)=>{
                if(allbookedSeatNo.includes(cur_bookedSeat.seatNo)){
                    alreadyBooked.push(cur_bookedSeat.seatNo)
                }
            })
            if(alreadyBooked.length > 0){
                return res.status(500).send({status:false,message:"This seat no "+ alreadyBooked.join() + " already booked"})
            }
        }
        req.busDetails = findBus;
        next();
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

module.exports.confirmBooking = async (req,res,next)=>{
    try{
        console.log("Body is here ",req.body);
        const {razorpay_order_id} = req.body;
        const findBooking = await bookingModel.findOne({"razorpayOrderId":razorpay_order_id,bookingStatus : "pending"});
        console.log("findBooking ",findBooking);
        if(!findBooking){
            return res.status(500).send({status:false,message:"Booking not found or booking already confirmed"});
        }
        const busDetails = await busModel.findOne({_id:mongoose.Types.ObjectId(findBooking.busId),is_active:true});
        if(!busDetails){
            return res.status(500).send({status:false,message:"Bus not found or inactive now"});
        }
        req.bookingDetails = findBooking;
        req.busDetails = busDetails;
        next();
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}