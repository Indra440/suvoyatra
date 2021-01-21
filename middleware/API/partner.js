// var express = require('express');
// var router = express.Router();
const session = require('express-session');
const partnerModel = require('../../models/partners');
const controller = require('../../controller/partner');
const _helper = require('../../Helpers/helpers');
const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports.validatePartner = async (req,res,next) =>{
    const headerToken = req.get('authorizationToken');
    // console.log("headerToken ",headerToken);
    const checkActive =  await controller.checkActivePartner(headerToken);
    if(checkActive.status == false){
        return res.redirect('/partner-login');
    }
    req.user = checkActive.payload;
    next();    
}


module.exports.createPartner = async(req,res,next) =>{
    console.log("Body ",req.body);
    if(req.body.name =="" || req.body.phone == "" ||req.body.email == "" || req.body.password == "" || req.body.password2 == ""){
        req.session.message = {
            type:'danger',
            intro:'Missing Field !! ',
            message: "Please fill alll the fields"
        }
        return res.redirect('/partner')
    }
    if(req.body.phone.length !=10){
        req.session.message = {
            type:'danger',
            intro:'Wrong Ph-No !! ',
            message: "Please enter a valid phone number"
        }
        return res.redirect('/partner')
    }
    if(!(emailRegexp.test(req.body.email))){
        console.log("Its her for email");
        req.session.message = {
            type:'danger',
            intro:'Wrong Email !! ',
            message: "Please enter a valid Email id"
        }
        return res.redirect('/partner')
    }
    if(req.body.password.length < 6){
        req.session.message = {
            type:'danger',
            intro:'Password Length !! ',
            message: "Please enter atleast 6 digit password"
        }
        return res.redirect('/partner')
    }
    if(req.body.password != req.body.password2){
        req.session.message = {
            type:'danger',
            intro:'Password not Matched !! ',
            message: "Both password are not matched"
        }
        return res.redirect('/partner')
    }
    if(!req.body.checkbox){
        console.log("Its inside this");
        req.session.message = {
            type:'danger',
            intro:'Tearms and Condition !! ',
            message: " You have to aggree with terms and condition"
        }
        return res.redirect('/partner')
    }
    next();
}

module.exports.checkPartnerEmail = async (req,res,next) =>{
    let message = {
        type:'danger',
        intro:'Email exist !!!',
        message: "This email is already exist in our platform"
    }
    try{
        const partnerEmail = req.body.email;
        const cur_partner = await partnerModel.findOne({"partenrEmail":partnerEmail})
        console.log("cur_partner ",cur_partner);
        if(cur_partner){
            console.log("Its hitting here");
            req.session.message = message;
            return res.redirect('/partner')
        }
        next();
    }catch(err){
        message.intro = "Error !!!"
        message.message = "Some error occured.Please try again"
        req.session.message = message;
        return res.redirect('/partner')
    }
}

module.exports.partnerLogin = async (req,res,next) =>{
    console.log("Body ",req.body);
    if(req.body.username =="" || req.body.password == ""){
        req.session.message = {
            type:'danger',
            intro:'Missing Field !! ',
            message: "Please fill alll the fields"
        }
        return res.redirect('/partner-login')
    }
    next()
}

module.exports.savePartner = async (req,res,next) =>{
    console.log("Body ",req.body);
    if((req.body.email == "") || !(emailRegexp.test(req.body.email))){
        return res.status(500).send({status:false,message:"Please check your email"})
    }
    if(req.body.phone == "" || String(req.body.phone).length !=10){
        return res.status(500).send({status:false,message:"Please check Contact number"})
    }
    next()
}

module.exports.changepassword = async (req,res,next) =>{
    console.log("Body ",req.body);
    // console.log("User ",req.user);
    console.log("Email ",req.body.username);
    if((req.body.username == "") || (!(emailRegexp.test(req.body.username)))){
        console.log("Its hitting here");
        return res.status(500).send({status:false,message:"Please check your email"})
    }
    if(req.body.currentPassword == "" || req.body.currentPassword.length < 6 ){
        return res.status(500).send({status:false,message:"Old password sould not be less than 6 digit"})
    }
    if(req.body.newPassword == "" || req.body.newPassword.length < 6 ){
        return res.status(500).send({status:false,message:"New password should be 6 or more digit"})
    }
    if(req.body.currentPassword == req.body.newPassword){
        return res.status(500).send({status:false,message:"Old and new password should not be same"})
    }
    if(req.body.newPassword != req.body.confirmPassword){
        return res.status(500).send({status:false,message:"New and confirm password should be same"})
    }

    next()
}


