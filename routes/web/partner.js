var express = require('express');
var router = express.Router();
const middleware = require("../../middleware/middleware");
const controller = require('../../controller/partner');
const jwt = require('jsonwebtoken');
const config = require('config');
const { response } = require('express');


router.post('/create-partner',
    middleware.api.partner.createPartner,
    middleware.api.partner.checkPartnerEmail,
async (req,res)=>{
    let partnerDetails = {
        name : req.body.name,
        phone : req.body.phone,
        email : req.body.email,
        password : req.body.password
    }
    // console.log("partnerDetails ",partnerDetails);
    let addPartner = await controller.addPartner(partnerDetails);
    // console.log("addPartner ",addPartner);
    if(addPartner.status == false){
        req.session.message = {
            type:'danger',
            intro:'Error !! ',
            message: addPartner.message
        }
        return res.redirect('/partner')   
    }else if(addPartner.status == true){
        req.session.message = {
            type:'success',
            intro:'Success !!',
            message: addPartner.message
        }
        return res.redirect('/partner')
    }
})

router.post('/partner-login',
    middleware.api.partner.partnerLogin,
    async (req,res,next)=>{
    console.log("Its comming here");
    let partnerLogin = await controller.partnerLogin(req.body);
    if(partnerLogin.status == false){
        req.session.message = {
            type:'danger',
            intro:'Error !! ',
            message: partnerLogin.message
        }
        // return res.redirect('/partner-login')
        res.status(500).send({"token":"",message:partnerLogin.message})   
    }else if(partnerLogin.status == true){
        req.session.message = {
            type:'success',
            intro:'Success !!',
            message: partnerLogin.message
        }
        let token = jwt.sign({'partnerInfo':partnerLogin.payload},config.get('LogintokenSecret'));
        res.status(200).send({"token":token,message:partnerLogin.message})
        // return res.redirect('/partner-dashboard')
    }
})

router.post('/check-partner-status',async(req,res) =>{
    // console.log("Req.body",req.body);
    const checkPartner = await controller.checkActivePartner(req.body.token);
    // console.log("checkPartner ",checkPartner);
    if(checkPartner.status == false){
        return res.status(500).send(checkPartner);
    }else if(checkPartner.status == true){
        return res.status(200).send(checkPartner);
    }
})

router.post('/save-partner-details',
    middleware.api.partner.validatePartner,
    middleware.api.partner.savePartner,
    async(req,res) =>{
        try{
            const curpartrnerDetails = req.user;
            const savePartner = await controller.savePartnerDetails(req.body,curpartrnerDetails);
            if(savePartner.status == false){
                return res.status(500).send(savePartner);
            }else if(savePartner.status == true){
                return res.status(200).send(savePartner);
            }
        }catch(e){
            console.log("Error for saving details of partner");
            return res.status(500).send(e);
        }
});

router.post('/change-password',
    middleware.api.partner.validatePartner,
    middleware.api.partner.changepassword,
    async(req,res) =>{
        try{
            const curpartnerDeatails = req.user;
            const passwordChange = await controller.changepasswordForPartner(req.body,curpartnerDeatails);
            console.log("passwordChange ",passwordChange);
            if(passwordChange.status == false){
                return res.status(500).send(passwordChange);
            }else{
                return res.status(200).send(passwordChange);
            }
        }catch(err){
            return res.status(500).send(err);
        }
});

router.get('/fetch-booking-history',
    middleware.api.partner.validatePartner,
    async(req,res) =>{
        try{
            const curpartnerDeatails = req.user;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const bookingHistory = await controller.fetchBookingHistory(curpartnerDeatails,page,startDate,endDate,bus_id);
            console.log("bookingHistory ",bookingHistory);
            if(bookingHistory.status == false){
                return res.status(500).send(bookingHistory);
            }else{
                return res.status(200).send(bookingHistory);
            }
        }catch(err){
            return res.status(500).send(err);
        }
});

module.exports = router;