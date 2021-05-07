var express = require('express');
var router = express.Router();
const middleware = require('../../middleware/middleware');
const controller = require('../../controller/bususer');
const jwt = require('jsonwebtoken');
const config = require('config');



router.post('/bus-user-login',
    middleware.api.bususers.busUserLogin,
    async (req,res,next)=>{
    try{
        const busDetails  = req.busDetails;
        let bususerLogin = await controller.busUserLogin(req.body,busDetails);
        console.log("bususerLogin ",bususerLogin.payload.flag);
        if(bususerLogin.status == false){
            return res.status(500).send(bususerLogin);
        }else{
            let tokenData ={
                _id : bususerLogin.payload._id,
                name : bususerLogin.payload.name,
                mobile : bususerLogin.payload.mobile,
                email : bususerLogin.payload.email,
                streetAddress : bususerLogin.payload.streetAddress,
                zipCode : bususerLogin.payload.zipCode,
                city : bususerLogin.payload.city,
                is_active : bususerLogin.payload.is_active,
                flag : bususerLogin.payload.flag,
                busId : busDetails._id
            }
            // bususerLogin.payload.busId = busDetails._id;
            let token = jwt.sign({'bususerInfo':tokenData},config.get('LogintokenSecret'));
            return res.status(200).send({status:true,message:"Login successful",token : token});
        }
    }catch(err){
        console.log("Error from here",err);
        return res.status(500).send(err);
    }    
})

router.post('/check-bususer-status',async(req,res) =>{
    // console.log("Req.body",req.body);
    const checkbususer = await controller.checkActiveBususer(req.body.token);
    console.log("checkbususer ",checkbususer);
    if(checkbususer.status == false){
        return res.status(500).send(checkbususer);
    }else if(checkbususer.status == true){
        return res.status(200).send(checkbususer);
    }
})

router.post('/save-bususer-details',
    middleware.api.bususers.validatebusUser,
    middleware.api.bususers.saveBusUser,
    async(req,res) =>{
        try{
            const curBusUserDetails = req.user;
            var curBusDetails = req.busDetails;
            const saveBususer = await controller.saveBususerDetails(req.body,curBusUserDetails,curBusDetails);
            console.log("saveBususer ",saveBususer);
            if(saveBususer.status == false){
                return res.status(500).send(saveBususer);
            }else if(saveBususer.status == true){
                return res.status(200).send(saveBususer);
            }
        }catch(e){
            console.log("Error for saving details of partner");
            return res.status(500).send(e);
        }
});

router.post('/change-password',
    middleware.api.bususers.validatebusUser,
    middleware.api.bususers.changepassword,
    async(req,res) =>{
        try{
            const curbusUserDetails = req.user;
            var curBusDetails = req.busDetails;
            const passwordChange = await controller.changepasswordForBususer(req.body,curbusUserDetails,curBusDetails);
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

router.get('/fetch-booking-list',
    middleware.api.bususers.validatebusUser,
    async(req,res) =>{
        try{
            const curbusUserDetails = req.user;
            const bookingList = await controller.fetchBookingList(curbusUserDetails);
            console.log("bookingList ",bookingList);
            if(bookingList.status == false){
                return res.status(500).send(bookingList);
            }else{
                return res.status(200).send(bookingList);
            }
        }catch(err){
            return res.status(500).send(err);
        }
});





module.exports = router;