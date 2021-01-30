const userModel = require('../models/users');
var otpGenerator = require('otp-generator');
const _helper = require('../Helpers/helpers');
const config = require('config');
const jwt = require('jsonwebtoken');

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
        let findUser = await userModel.findOne(findAndSaveUserquery);
        if(!findUser){
            isOldUser = false;
        }
    
        let otp = otpGenerator.generate(6, { upperCase: false, specialChars: false,alphabets :false});
        if(isOldUser == false){
            findAndSaveUserquery.Verification = {
                last_otp : otp,
                otp_generation_time : new Date()
            }
            let model = new userModel(findAndSaveUserquery);
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
                message : "Hey User! Thank you for connecting with Suvoyatra.Your login Otp is <b>"+otp+". This Otp is valid for 10 minutes."    
            }
            const sendMail = await _helper.utility.common.sendMail(EmailDetails);
            console.log("sendMail ",sendMail);
            if(sendMail != true){
                response.message = "Not able to send an email"
                return response;
            }
        }
        if(usernameType == "mobile"){
            let EmailDetails = {
                to:username,
                message : "Hey User! Thank you for connecting with Suvoyatra.Your login Otp is "+otp+". This Otp is valid for 10 minutes."    
            }
            const sendSMS = await _helper.utility.common.sendSms(EmailDetails);
            if(sendSMS != true){
                response.message = "Not able to send an email"
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
        let token = jwt.sign({'userInfo':user},config.get('usertokenSecret'));
        response.payload = token
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}


module.exports = {
    userLogin,
    userOptSubmit
}