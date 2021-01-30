
const { restart } = require('nodemon');
const _helper = require('../../Helpers/helpers');
const userModel = require('../../models/users');
const mongoose = require('mongoose');

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
    const fetchUser = await userModel.findOne({_id:mongoose.Types.ObjectId(user_id),is_active:true});
    console.log("fetchUser ",fetchUser);
    if(!fetchUser){
        return res.status(500).send({status:false,message:"User is not exist"});
    }
    let last_otp = fetchUser.Verification.last_otp;
    if(!last_otp || last_otp == null || last_otp == undefined){
        return res.status(500).send({status:false,message:"Looks like user is not requested for verification yet"});
    }
    if(!String(user_id) == last_otp){
        return res.status(500).send({status:false,message:"Otp does not matched"});
    }
    if(_helper.utility.common.calulateTime(fetchUser.Verification.otp_generation_time,new Date()) > 10){
        return res.status(500).send({status:false,message:"verification time over! please try again"});
    }
    req.user = fetchUser;
    console.log("its comming  here",req.user);
    next();
}