
const busModel = require("../../models/buses");
const mongoose = require('mongoose');
const controller = require('../../controller/bususer');



module.exports.validatebusUser = async (req,res,next) =>{
    try{
        const headerToken = req.get('authorizationToken');
        const checkActive =  await controller.checkActiveBususer(headerToken);
        console.log("checkActive ",checkActive);
        if(checkActive.status == false){
            return res.redirect('/user-login');
        }
        req.user = checkActive.payload;
        next()
    }catch(err){
        return res.redirect('/user-login');
    }    
}

module.exports.busUserLogin = async (req,res,next) =>{
    console.log("Body ",req.body);
    if(req.body.busId =="" || req.body.busId == null || req.body.busId == undefined){
        return res.status(500).send({status:false,message:"Please select a bus"});
    }
    if(req.body.username =="" || req.body.username == null || req.body.username == undefined || String(req.body.username).length !=10 || isNaN(req.body.username)){
        return res.status(500).send({status:false,message:"Please enter a valid username"});
    }
    const fetchBus = await busModel.findOne({_id:mongoose.Types.ObjectId(String(req.body.busId)),is_active : true});
    if(!fetchBus){
        return res.status(500).send({status:false,message:"Bus not found or inactive"});
    }
    req.busDetails = fetchBus;
    next()
}

module.exports.saveBusUser = async (req,res,next) =>{
    const curBusUserDetails = req.user;
    console.log("curBusUserDetails ",curBusUserDetails);

    if(req.body.mobile == "" || String(req.body.mobile).length !=10){
        return res.status(500).send({status:false,message:"Please check Contact number"})
    }
    if(req.body.email !="" && !(emailRegexp.test(req.body.email))){
        return res.status(500).send({status:false,message:"Please check your email"})
    }
    const findBus = await busModel.findOne({_id:mongoose.Types.ObjectId(String(curBusUserDetails.busId)),is_active : true});
    console.log("findBus ",findBus);
    if(!findBus){
        return res.status(500).send({status:false,message:"Bus not found or inactive"})
    }
    console.log("Its comming here");
    if(curBusUserDetails.mobile != req.body.mobile){
        let allUsers = curBusUserDetails.flag == "conductor" ? fetChBus.conductors : curBusUserDetails.flag == "driver" ? fetChBus.conductors : [];
        if(!allUsers || allUsers.length <= 0){
            return res.status(500).send({status:false,message:"Usertype not found"})
        }
        let findUser = allUsers.filter(user => String(user.mobile) == String(req.body.mobile) && user.is_active == true);
        if(findUser && findUser[0]){
            return res.status(500).send({status:false,message:"This email id is already associated with another "+ curBusUserDetails.flag})
        }
    }
    req.busDetails = findBus;
    next()
}

module.exports.changepassword = async (req,res,next) =>{
    const curBusUserDetails = req.user;
    if((req.body.username == "") || String(req.body.username).length !=10 || isNaN(req.body.username)){
        return res.status(500).send({status:false,message:"Please check your username"})
    }
    if(req.body.currentPassword == "" || req.body.currentPassword.length < 6 ){
        return res.status(500).send({status:false,message:"Old password sould not be less than 6 digit"})
    }
    if(req.body.newPassword == "" || req.body.newPassword.length < 6 ){
        return res.status(500).send({status:false,message:"New password should should have 6 or more digit"})
    }
    if(req.body.currentPassword == req.body.newPassword){
        return res.status(500).send({status:false,message:"Old and new password should not be same"})
    }
    if(req.body.newPassword != req.body.confirmPassword){
        return res.status(500).send({status:false,message:"New and confirm password should be same"})
    }
    const findBus = await busModel.findOne({_id:mongoose.Types.ObjectId(String(curBusUserDetails.busId)),is_active : true});
    console.log("findBus ",findBus);
    if(!findBus){
        return res.status(500).send({status:false,message:"Bus not found or inactive"})
    }
    req.busDetails = findBus;
    next()
}


