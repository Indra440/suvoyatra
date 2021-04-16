const enduserModel = require('../models/endusers');
var otpGenerator = require('otp-generator');
const _helper = require('../Helpers/helpers');
const config = require('config');
const jwt = require('jsonwebtoken');
const bookingModel = require('../models/bookings');

const userLogin = async (username,usernameType)=>{
    var isOldUser = true;
    let findAndSaveUserquery = {};
    let response = {
        status:false,
        message : "",
        payload:{}
    }
    try{
        if(usernameType == "email"){
            findAndSaveUserquery.userEmail = username;
        }
        if(usernameType == "mobile"){
            findAndSaveUserquery.user_Ph_Number = username;
        }
        let findUser = await enduserModel.findOne(findAndSaveUserquery);
        if(!findUser){
            isOldUser = false;
        }
    
        let otp = otpGenerator.generate(6, { upperCase: false, specialChars: false,alphabets :false});
        if(isOldUser == false){
            findAndSaveUserquery.Verification = {
                last_otp : otp,
                otp_generation_time : new Date()
            }
            let model = new enduserModel(findAndSaveUserquery);
            var saveUser = await model.save();
        }else{
            findUser.Verification = {
                last_otp : otp,
                otp_generation_time : new Date(),
                verified : false
            }
            var saveUser =  await findUser.save();
        }
        if(!saveUser){
            response.message = "Erro occur during user login! please try again"
            return response;
        }
    
        if(usernameType == "email"){
            let EmailDetails = {
                to:username,
                subject : "Suvoyatra User verification",
                message : "Hey User! Thank you for connecting with Suvoyatra.Your login Otp is <b>" + otp + "</b>. This Otp is valid for 10 minutes."    
            }
            const sendMail = await _helper.utility.common.sendMail(EmailDetails);
            console.log("sendMail ",sendMail);
            if(sendMail != true){
                response.message = "Not able to send an email.Please try again"
                return response;
            }
        }
        if(usernameType == "mobile"){
            let MsgDetails = {
                to:username,
                message : "Hey User! Thank you for connecting with Suvoyatra.Your login Otp is " + otp + ". This Otp is valid for 10 minutes."    
            }
            const sendSMS = await _helper.utility.common.sendSms(MsgDetails);
            if(sendSMS != true){
                response.message = "Not able to send an sms.Please try again"
                return response;
            }
        }
        response.status = true;
        response.message = "We have sent an otp in your "+ ((usernameType == "email") ? "email" : "Phone number")+".This otp is valid for next 10 minutes";
        response.payload.id = saveUser._id;
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const userOptSubmit = async (user,otp) =>{
    let response = {
        status:false,
        message : "",
        payload:{}
    }
    try{
        user.Verification ={
            last_otp : otp,
            otp_generation_time : new Date(),
            verified : true
        }
        await user.save();
        response.status = true;
        response.message = "Otp varified successfully";
        let token = jwt.sign({'userInfo':user},config.get('LogintokenSecret'));
        response.payload = token
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const checkActiveUser = async(token) =>{
    let response = {
        status:false,
        message : "invalid token",
        payload : {}
    }
    try{
        if(!token || token ==""){
            return response;
        }
        console.log("Token ",token);
        const decodedData = await _helper.utility.common.decodeToken(token);
        console.log("decodedData ",decodedData);
        if(!decodedData){
            return response;
        }
        let userInfo = decodedData.userInfo;
        const fetChEnduser = await enduserModel.findOne({_id:userInfo._id,is_active:true});
        console.log("fetChEnduser ",fetChEnduser);
        if(!fetChEnduser){
            return response;
        }
        response.payload = fetChEnduser;
        response.status = true;
        response.message = "Token Validate";
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const saveUserDetails = async(curUserDeatails,oldUserDetails) =>{
    let response = {
        status:false,
        message : "invalid token",
        payload : {}
    }
    try{
        if(curUserDeatails.email != oldUserDetails.userEmail || curUserDeatails.phone != oldUserDetails.user_Ph_Number){
            const fetchUser = await enduserModel.findOne({$and:[{"userEmail":curUserDeatails.email},{"user_Ph_Number":curUserDeatails.phone}],is_Active:true});
            if(fetchUser != null || fetchUser != undefined){
                console.log("Its inside this point");
                response.message = "This email id or phone number is already associated with another acconut";
                return response;
            }
        }
        oldUserDetails.userName =   curUserDeatails.name == "" ? oldUserDetails.userName : curUserDeatails.name;
        oldUserDetails.user_Ph_Number =   curUserDeatails.phone == "" ? oldUserDetails.user_Ph_Number : curUserDeatails.phone;
        oldUserDetails.userEmail = curUserDeatails.email == "" ? oldUserDetails.userEmail : curUserDeatails.email;
        oldUserDetails.streetAddress = curUserDeatails.address == "" ? oldUserDetails.streetAddress : curUserDeatails.address;
        oldUserDetails.zipCode =  curUserDeatails.zipCode == "" ? oldUserDetails.zipCode : curUserDeatails.zipCode;
        oldUserDetails.city = curUserDeatails.city == "" ? oldUserDetails.city : curUserDeatails.city;
    
        let userDeatsils = new enduserModel(oldUserDetails); 
        userDeatsils.save();
        response.status = true;
        response.message = "Data saved successfully";
        response.payload = oldUserDetails;
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const bookTicket = async (userDetails,bookingDetails) =>{
    let response = {
        status:false,
        message : "",
        payload : {}
    }
    try{
        let todayDate = new Date();
        todayDate.setHours(todayDate.getHours()+5);
        todayDate.setMinutes(todayDate.getMinutes()+30);

        bookingPayload = {
            userId : userDetails._id,
            pickupLocation :  bookingDetails.pickup_location,
            dropLocation : bookingDetails.drop_location,
            busId : bookingDetails.bus_id,
            bookingAmmount : bookingDetails.total_ammount,
            bookingFor : new Date(bookingDetails.departure_date),
            bookingSeat : JSON.parse(bookingDetails.seats),
            passengersDetails : JSON.parse(bookingDetails.passengerDetails),
            ticketFor :{
                email : bookingDetails.ticketEmail && bookingDetails.ticketEmail != "" ? bookingDetails.ticketEmail : null,
                mobile_no : bookingDetails.ticketmobile_no && bookingDetails.ticketmobile_no != "" ? bookingDetails.ticketmobile_no : null  
            }
        }
        let model = new bookingModel(bookingPayload);
        console.log("bookingPayload ",bookingPayload);
        const createBooking = await model.save();
            if(!createBooking){
                response.message = "Error occur while booking"
                return response;
            }
        console.log("createBooking ",createBooking);
        let createRazorpayOrderId = await _helper.utility.common.createRazorpayOrder(createBooking.bookingAmmount)
        createBooking.razorpayOrderId = createRazorpayOrderId.data.id;
        await createBooking.save(); 
        console.log("createRazorpayOrderId ",createRazorpayOrderId);
        response.status = true;
        response.message = "Bus booking created";
        response.payload.order_id = createBooking.razorpayOrderId;
        response.payload.key = process.env.RAZORPAY_KEY_ID;
        console.log("Response is here ",response);
        return response;

    }catch(err){
        response.message = err.message;
        return response;
    }
}
function reformatDate(date){
    let finalDatewithTime = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    let finalDate = finalDatewithTime.split(" ")[0];
    return finalDate;
}

const confirmBooking = async (userDetails,busDetails,bookingDetails,paymentDetails) =>{
    let response = {
        status:false,
        message : "",
        payload : {}
    }
    try{
        let checkConfirmBooking = await _helper.utility.common.verifyRazorpaSignature(paymentDetails)
        console.log("checkConfirmBooking ",checkConfirmBooking);
        if(!checkConfirmBooking){
            response.message = "Payment confirmation Failed"
            return response;
        }else{
            let route = bookingDetails.pickupLocation + " to " + bookingDetails.dropLocation;
            let ticketNo = bookingDetails.ticketNo;
            let passenger = "";
            bookingDetails.passengersDetails.map((cur_passenger ,index) =>{
                passenger += cur_passenger.passengerName + " " + cur_passenger.passengerAge;
                index != (bookingDetails.passengersDetails.length -1) ?  passenger+= "," : "";
            })
            let Travels = busDetails.busName;
            let departureTime = busDetails.busTiming.departureTime + (busDetails.busTiming.departureTime.split(":")[0] >= 12 ? " PM" : " AM" ) + " " + reformatDate(bookingDetails.bookingFor);
            let seatNo = "";
            bookingDetails.bookingSeat.map((cur_seat,index) =>{
                seatNo += cur_seat.seatNo;
                index != (bookingDetails.bookingSeat.length -1) ? seatNo += "," : "";
            })

            if(bookingDetails.ticketFor.email){
                let finalEmail = "Suvoyatra mTicket !!! <br><br> Route: "+ route + "<br> Ticket No: "+ ticketNo + "<br>Passenger: " + passenger + "<br>Travels: "+ Travels +
                                "<br>Departure: "+ departureTime + "<br>Seat Numbers: "+ seatNo + "<br>Total fare paid: " + bookingDetails.bookingAmmount + "<br><br><br>" +
                                "Thank you for using Suvoyatra. Have a safe and happy journey "; 
                let EmailDetails = {
                    to:bookingDetails.ticketFor.email,
                    subject : "Suvoyatra Ticket",
                    message : finalEmail
                }
                const sendMail = await _helper.utility.common.sendMail(EmailDetails);
                console.log("sendMail ",sendMail);
                if(sendMail != true){
                    response.message = "Not able to send the ticket via email.Please contact with admin."
                    return response;
                }
            }

            if(bookingDetails.ticketFor.mobile_no){
                let MsgDetails = {
                    to:bookingDetails.ticketFor.mobile_no,
                    message : "Suvoyatra mTicket !!!   Route: "+ route + "  Ticket No: "+ ticketNo + "  Passenger: " + passenger + "  Travels: "+ Travels +
                                "  Departure: "+ departureTime + "  Seat Numbers: "+ seatNo + "  Total fare paid: " + bookingDetails.bookingAmmount + "         " +
                                "Thank you for using Suvoyatra. Have a safe and happy journey "    
                }
                const sendSMS = await _helper.utility.common.sendSms(MsgDetails);
                if(sendSMS != true){
                    response.message = "Not able to send the ticket via sms.Please contact with admin."
                    return response;
                }
            }

            bookingDetails.bookingStatus = "confirmed";
            await bookingDetails.save();
            response.status = true;
            response.message = "Booking confirmed";
            console.log("Response is here ",response);
            return response;
        }
    }catch(err){
        response.message = err.message;
        return response;
    }
}


module.exports = {
    userLogin,
    userOptSubmit,
    checkActiveUser,
    saveUserDetails,
    bookTicket,
    confirmBooking
}