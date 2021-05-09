
const _helper = require('../Helpers/helpers');
const busModel = require('../models/buses');
const bookingModel = require('../models/bookings');
const mongoose = require('mongoose');



const busUserLogin = async (bususerlogindetails,busDetails)=>{
    let response = {
        status:false,
        message : "",
        payload:{}
    }
    try{
        const conductors = busDetails.conductors;
        const drivers = busDetails.drivers;
        var  isConductor = conductors.filter(conductor => conductor.mobile == String(bususerlogindetails.username) && conductor.is_active == true);
        if(!isConductor || !isConductor[0]){
            var isDriver = drivers.filter(driver => driver.mobile == String(bususerlogindetails.username) && driver.is_active == true)
            if(!isDriver || !isDriver[0]){
                response.message = "User not found or inactive";
                return response;
            }else{
                let driverPassword = isConductor[0].password
                const isValidPassword = await _helper.utility.common.checkPassword(String(bususerlogindetails.password),driverPassword)
                if(!isValidPassword){
                    response.message = "Unauthorised credentials";
                    return response;
                }
            }
        }else{
            let conductorPassword = isConductor[0].password
            const isValidPassword = await _helper.utility.common.checkPassword(String(bususerlogindetails.password),conductorPassword)
            if(!isValidPassword){
                response.message = "Unauthorised credentials";
                return response;
            }
        }
        if(isConductor || isConductor[0]){
            response.status = true;
            response.message = "Login successful";
            isConductor[0].flag = "conductor";
            response.payload = isConductor[0];
            return response
        }

        if(isDriver || isDriver[0]){
            response.status = true;
            response.message = "Login successful";
            isDriver[0].flag = "driver";
            response.payload = isDriver[0];
            return response
        }
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const checkActiveBususer = async(token) =>{
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
        let bususerInfo = decodedData.bususerInfo;
        console.log("flag ",bususerInfo);
        const fetChBus = await busModel.findOne({_id:bususerInfo.busId,is_active:true});
        if(!fetChBus){
            response.message = "Bus not found or inactive"
            return response;
        }
        let allUsers = bususerInfo.flag == "conductor" ? fetChBus.conductors : bususerInfo.flag == "driver" ? fetChBus.conductors : [];
        if(!allUsers || allUsers.length <= 0){
            response.message = "Usertype not found";
            return response;
        }
        let findUser = allUsers.filter(user => String(user._id) == String(bususerInfo._id) && user.is_active == true);
        if(!findUser || !findUser[0]){
            response.message = "User not found or inactive";
            return response;
        }
        findUser[0].busId = bususerInfo.busId;
        findUser[0].flag = bususerInfo.flag;
        response.payload = findUser[0];
        response.busId = bususerInfo.busId;
        response.flag = bususerInfo.flag;
        response.status = true;
        response.message = "Token Validate";
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const saveBususerDetails = async(curbususerDetails,oldbususerDetails,curBusDetails) =>{
    let response = {
        status:false,
        message : "invalid token",
        payload : {}
    }
    try{
        console.log("curbususerDetails ",curbususerDetails);
        let flag = oldbususerDetails.flag == "conductor" ? "conductors" : oldbususerDetails.flag == "driver" ? "drivers" : "";
        console.log("flag ",flag);
        curBusDetails[flag].map(async function(cur_user){
            if(String(cur_user._id) == String(oldbususerDetails._id)){
                cur_user.name =   curbususerDetails.name == "" ? cur_user.name : curbususerDetails.name;
                cur_user.ph_no =   curbususerDetails.phone == "" ? cur_user.ph_no : curbususerDetails.phone;
                cur_user.email = curbususerDetails.email == "" ? cur_user.email : curbususerDetails.email;
                cur_user.streetAddress = curbususerDetails.address == "" ? cur_user.streetAddress : curbususerDetails.address;
                cur_user.zipCode =  curbususerDetails.zipCode == "" ? cur_user.zipCode : curbususerDetails.zipCode;
                cur_user.city = curbususerDetails.city == "" ? cur_user.city : curbususerDetails.city;
            }
        })

        // let partnerDeatsils = new usersModel(oldPartnerDetails); 
        await curBusDetails.save();
        response.status = true;
        response.message = "Data saved successfully";
        response.payload = curbususerDetails;
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const changepasswordForBususer = async (curPasswordDetails,bususerDetails,curBusDetails) =>{
    let response = {
        status:false,
        message : "",
    }
    try{
        const checkOldpassword = await _helper.utility.common.checkPassword(curPasswordDetails.currentPassword,bususerDetails.password);
        console.log("checkOldpassword ",checkOldpassword);
        if(!checkOldpassword){
            response.message = "Old password is not matched";
            return response;
        }
        const hash = await _helper.utility.common.encryptPassword(10,curPasswordDetails.newPassword);
        let flag = bususerDetails.flag == "conductor" ? "conductors" : bususerDetails.flag == "driver" ? "drivers" : "";
        curBusDetails[flag].map(async function(cur_user){
            if(String(cur_user._id) == String(bususerDetails._id)){
                cur_user.password = hash;
            }
        })
        await curBusDetails.save();
        response.status = true;
        response.message = "Password changed successfully";
        return response;         
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const fetchBookingList = async (bususerDetails) =>{
    let response = {
        status:false,
        message : "",
        payload : []
    }
    try{
        let final_startDate = new Date();
        let final_endDate = new Date();
        final_endDate.setDate(final_endDate.getDate()+1)
        final_startDate.setHours(final_startDate.getHours()+5);
        final_startDate.setMinutes(final_startDate.getMinutes()+30);
        console.log(" Before set final_startDate ",final_startDate);

        // final_startDate.setHours(0,0,0);

        final_endDate.setHours(final_endDate.getHours()+5);
        final_endDate.setMinutes(final_endDate.getMinutes()+30);
        console.log(" Before final_endDate ",final_endDate);

        // final_endDate.setHours(0,0,0);
        console.log("final_startDate ",final_startDate);
        console.log("final_endDate ",final_endDate);
        const fetchBookingList = await bookingModel.aggregate([
            {
                $match:{
                    createdAt :{
                        $gte :final_startDate ,
                        $lt :final_endDate 
                    },
                    busId : mongoose.Types.ObjectId(bususerDetails.busId),
                    bookingStatus : "confirmed"
                }
            },
            {
                $project:{
                    _id:1,
                    ticketNo : 1,
                    pickupLocation : 1,
                    dropLocation : 1,
                    bookingAmmount :1,
                    bookingFor : 1,
                    bookingSeat : 1,
                    passengersDetails : 1
                }
            }
        ])
        if(!fetchBookingList){
            response.message = "Error found while fetching the booking list";
            return response;
        }
        response.status = true;
        response.message = "Booking list fetched successfully";
        response.payload = fetchBookingList
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}

module.exports = {
    busUserLogin,
    checkActiveBususer,
    saveBususerDetails,
    changepasswordForBususer,
    fetchBookingList
}