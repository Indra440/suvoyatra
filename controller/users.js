const enduserModel = require('../models/endusers');
var otpGenerator = require('otp-generator');
const _helper = require('../Helpers/helpers');
const config = require('config');
const jwt = require('jsonwebtoken');
const bookingModel = require('../models/bookings');
const nodemailer = require('nodemailer');
const hbs = require("nodemailer-express-handlebars");
const mongoose = require("mongoose");

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
            if(findUser.is_active == false){
                response.message = "You are now an in-active user"
                return response;
            }
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

const bookTicket = async (userDetails,busDetails,bookingDetails) =>{
    let response = {
        status:false,
        message : "",
        payload : {}
    }
    try{
        const bookingfor = new Date();
        const departureTime = busDetails.busTiming.departureTime;
        bookingfor.setHours(departureTime.split(":")[0]);
        bookingfor.setMinutes(departureTime.split(":")[1]);
        let todayDate = new Date();
        todayDate.setHours(todayDate.getHours()+5);
        todayDate.setMinutes(todayDate.getMinutes()+30);
        // console.log("Final booking details ",bookingDetails);
        // console.log("todayDate ",todayDate);

        bookingPayload = {
            userId : userDetails._id,
            pickupLocation :  bookingDetails.pickup_location,
            dropLocation : bookingDetails.drop_location,
            busId : bookingDetails.bus_id,
            bookingAmmount : bookingDetails.total_ammount,
            bookingFor : bookingfor,
            bookingSeat : JSON.parse(bookingDetails.seats),
            passengersDetails : JSON.parse(bookingDetails.passengerDetails),
            ticketFor :{
                email : bookingDetails.ticketEmail && bookingDetails.ticketEmail != "" ? bookingDetails.ticketEmail : null,
                mobile_no : bookingDetails.ticketmobile_no && bookingDetails.ticketmobile_no != "" ? bookingDetails.ticketmobile_no : null  
            },
            createdAt : todayDate
        }

        console.log("bookingPayload ",bookingPayload);

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
            let bookingId = String(bookingDetails._id)
            if(bookingDetails.ticketFor.email){
                // let finalEmail = "Suvoyatra mTicket !!! <br><br> Route: "+ route + "<br> Ticket No: "+ ticketNo + "<br>Passenger: " + passenger + "<br>Travels: "+ Travels +
                //                 "<br>Departure: "+ departureTime + "<br>Seat Numbers: "+ seatNo + "<br>Total fare paid: " + bookingDetails.bookingAmmount + "<br><br><br>" +
                //                 "Thank you for using Suvoyatra. Have a safe and happy journey "; 
                // let EmailDetails = {
                //     to:bookingDetails.ticketFor.email,
                //     subject : "Suvoyatra Ticket",
                //     message : finalEmail
                // }
                // const sendMail = await _helper.utility.common.sendMail(EmailDetails);
                // console.log("sendMail ",sendMail);
                // if(sendMail != true){
                //     response.message = "Not able to send the ticket via email.Please contact with admin."
                //     return response;
                // }
                let sendTicketMail = await sendTicket(bookingDetails.ticketFor.email,departureTime,bookingDetails.pickupLocation,bookingDetails.dropLocation,bookingId,Travels,seatNo,ticketNo,bookingDetails.passengersDetails,bookingDetails.bookingAmmount)
                if(sendTicketMail != true){
                    response.message = "Not able to send the ticket via email.Please contact with admin."
                    return response;
                }
            }

            // var logotext = "",logoLink="";
            // var preImage = req.protocol+"://"+req.get('host');
            // var abbr = req.body.abbr;
            // if(abbr == "PF"){
            // logotext = "PostFilter Pro";
            // // logoLink = preImage +"/images/PF_logo.png";
            // logoLink = '<img src="'+preImage+'/images/PF_PRO_logo.png" alt="logo">';
            // }else if(abbr == "FC"){
            // logotext = "FriendConnector";
            // // logoLink =  preImage +"/images/FC_logo.png";
            // logoLink = '<img src="'+preImage+'/images/FC_logo.png" alt="logo" style="margin-left: 20px;">';   
            // }
            // var mailOptions = {
            //     from: process.env.SERVICE_EMAIL,
            //     to: req.body.email,
            //     subject: 'Password Reset',
            //     template:'emailtemplate',
            //     context:{
            //         password:user.newpassword,
            //         text:logotext,
            //         logo:logoLink
            //     }
            // };

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

async function sendTicket(toMail,departureTime,pickupLocation,dropLocation,bookingId,busName,seatNo,ticketNo,passangers,ammount){
    try{
        let finalPassanger = `<tr>`;
        passangers.map((cur_passanger,index)=>{
        if((index+1) % 2 != 0){
            finalPassanger += `<tr> <th class="column-top" width="280"
                style="font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal; vertical-align:top;">
                <table width="100%" border="0"
                    cellspacing="0" cellpadding="0">
                    <tr>
                        <td valign="top">
                            <table width="100%" border="0"
                                cellspacing="0"
                                cellpadding="0">
                                <tr>
                                    <td class="h5-black black"
                                        style="font-family:'Raleway', Arial,sans-serif; font-size:14px; line-height:18px; text-align:left; padding-bottom:15px; text-transform:uppercase; font-weight:bold; color:#000000;">
                                        <multiline> PASSENGER `+(index+1)+`  </multiline>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text grey pb10"
                                        style="font-family:'Raleway', Arial,sans-serif; font-size:14px; line-height:22px; text-align:left; color:#a1a1a1; padding-bottom:10px;">
                                        <multiline>`+cur_passanger.passengerName+`</multiline>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text"
                                        style="color:#5d5c5c; font-family:'Raleway', Arial,sans-serif; font-size:14px; line-height:22px; text-align:left;">
                                        <multiline>`+cur_passanger.passengerAge+`</multiline>
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td class="img" valign="top"
                            width="15"
                            style="font-size:0pt; line-height:0pt; text-align:left;">
                        </td>
                    </tr>
                </table>
            </th>`;
        }
    
        if((index != (passangers.length-1)) && ((index+1) % 2 != 0)){
            finalPassanger += `<th class="column-empty" width="30"
                        style="font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal; direction:ltr;">
                    </th>`;
        }
    
        if((index+1) % 2 == 0){
            finalPassanger += `<th class="column-top" width="280"
                style="font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal; vertical-align:top;">
                <table width="100%" border="0"
                    cellspacing="0" cellpadding="0"
                    class="booking-dtls">
                    <tr>
                        <td class="h5-black black"
                            style="font-family:'Raleway', Arial,sans-serif; font-size:14px; line-height:18px; text-align:left; padding-bottom:15px; text-transform:uppercase; font-weight:bold; color:#000000;">
                            <multiline> PASSENGER `+(index+1)+`  </multiline>
                        </td>
                    </tr>
                    <tr>
                        <td class="text grey pb10"
                            style="font-family:'Raleway', Arial,sans-serif; font-size:14px; line-height:22px; text-align:left; color:#a1a1a1; padding-bottom:10px;">
                            <multiline>`+cur_passanger.passengerName+`</multiline>
                        </td>
                    </tr>
                    <tr>
                        <td class="text"
                            style="color:#5d5c5c; font-family:'Raleway', Arial,sans-serif; font-size:14px; line-height:22px; text-align:left;">
                            <multiline>`+cur_passanger.passengerAge+`</multiline>
                        </td>
                    </tr>
                </table>
            </th> </tr>`
        }
    
        })

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            service:'gmail',
            auth: {
              type: "OAUTH2",
              user: process.env.EMAILUSER, // generated ethereal user
              pass: process.env.EMAILPASSWORD, // generated ethereal password
              clientId : process.env.OAUTH_CLIENT_ID,
              clientSecret : process.env.OAUTH_CLIENT_SECRET,
              refreshToken : process.env.OAUTH_REFRESH_TOKEN,
              accessToken : process.env.OAUTH_ACCESS_TOKEN,
            //   expires: 3599
            }
          });
        
        const handlebarOptions = {
          viewEngine: {
            extName: '.hbs',
            partialsDir: 'views/templete',
            layoutsDir: 'views/templete',
            defaultLayout: 'tickettemplate.hbs',
          },
          viewPath: 'views/templete',
          extName: '.hbs',
        };
        
        transporter.use('compile',hbs(handlebarOptions));
    
        var mailOptions = {
            from: process.env.EMAILUSER,
            to: toMail,
            subject: 'Suvoyatra Ticket',
            template:'tickettemplate',
            context:{
                departureTime : departureTime,
                pickupLocation : pickupLocation,
                dropLocation : dropLocation,
                bookingId : bookingId,
                busName : busName,
                seatNo : seatNo,
                ticketNo : ticketNo,
                passangerDetails : finalPassanger,
                ammount : ammount
            }
        };
        console.log("Final mail option",mailOptions);
        console.log("Final transporter",transporter);
        let info = await transporter.sendMail(mailOptions);
        console.log("Info is here ",info);
        return true
    }catch(e){
        console.log("Error is here ",e);
        return false;
    }
}

const fetchBookingHistory = async (userDetails,page,startDate,endDate) =>{
    let response = {
        status:false,
        message : "",
        payload : {}
    }
    try{
        const userId = userDetails._id;
        let Page = page ? page : 1;
        const limit = 3
        let final_startDate = new Date(String(startDate));
        let final_endDate = new Date(String(endDate));
        final_endDate.setDate(final_endDate.getDate()+1)
        let bookingHistoryQuery =[
            {
                $match:{createdAt :{$gte :final_startDate ,$lt :final_endDate },userId:mongoose.Types.ObjectId(userId)}
            },
            {
                $lookup:{
                    from: "buses",
                    localField: "busId",
                    foreignField: "_id",
                    as: "busDetails"
                }
            },
            {
               $unwind:{
                    path: "$busDetails",
                    preserveNullAndEmptyArrays: false
               } 
            },
            {
                $project:{
                    _id:1,
                    bookingFor : 1,
                    pickupLocation : 1,
                    dropLocation : 1,
                    bookingStatus :1,
                    bookingAmmount :1,
                    "busDetails.busName" : 1
                } 
             }
        ];
        console.log("bookingHistoryQuery ",bookingHistoryQuery);
        var totalBookingHistoryList  = (await bookingModel.aggregate(bookingHistoryQuery)).length
        console.log("totalBookingHistoryList ",totalBookingHistoryList);

        if(Page && Page != null && Page !="" && Page !=undefined){
            bookingHistoryQuery = [...bookingHistoryQuery,{ $skip: (Page-1) * limit},{ $limit: limit }]
        }
        console.log("Page is ",page);
        console.log("bookingHistoryQuery ",bookingHistoryQuery);
        var bookingList = await bookingModel.aggregate(bookingHistoryQuery);
        if(!bookingList){
            response.message = "Error occured while getting booking history list"
            return response;
        }
        response.status = true;
        response.message = "Bookinghistory list fetch successfully";
        response.payload = bookingList;
        response.totalPages = Math.ceil(totalBookingHistoryList/limit);
        response.currentPage = Number(page);
        return response;
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
    confirmBooking,
    fetchBookingHistory
}