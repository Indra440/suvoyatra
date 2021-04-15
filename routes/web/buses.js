var express = require('express');
var router = express.Router();
const fs = require('fs');
const controller = require('../../controller/buses');
const middleware = require('../../middleware/middleware');
const _helper = require("../../Helpers/helpers");



router.post("/addBus",
    middleware.api.partner.validatePartner,
    middleware.api.buses.uploadBusimages,
    middleware.api.buses.addBus,
async (req,res) =>{
    
    let files = {
        front_side_fileContent : req.files.front_side ? fs.readFileSync(req.files.front_side[0].path) : "",
        left_side_fileContent : req.files.left_side ? fs.readFileSync(req.files.left_side[0].path) : "",
        right_side_fileContent : req.files.right_side ? fs.readFileSync(req.files.right_side[0].path): "",
        back_side_fileContent : req.files.back_side ? fs.readFileSync(req.files.back_side[0].path) : "",
        driver_cabin_fileContent : req.files.driver_cabin ? fs.readFileSync(req.files.driver_cabin[0].path) : "", 
        entire_inside_fileContent : req.files.entire_inside ? fs.readFileSync(req.files.entire_inside[0].path) : "",
    }
    try{
        let existBusDetails = req.existBusDetails ? req.existBusDetails : ""
        const addBus = await controller.addBus(req.user,req.body,files,existBusDetails);
        await _helper.utility.buses.remove_all_images_for_buses(req.files);
        console.log("addBus ",addBus);
        if(addBus.status == false){
            return res.status(500).send(addBus);
        }else if(addBus.status == true){
            return res.status(200).send(addBus);
        }
    }catch(err){
        await _helper.utility.buses.remove_all_images_for_buses(req.files);
        return res.status(500).send({status:false,message:err.message});
    }
});

router.get("/fetchBuslist",
    middleware.api.partner.validatePartner,
async (req,res) =>{
    try{
        let page = req.query.page;
        console.log("FetchBuslist router page ",page);
        const fetchBuslist = await controller.getBuslist(req.user,page);
        console.log("fetchBuslist ",fetchBuslist);
        if(fetchBuslist.status == false){
            return res.status(500).send(fetchBuslist);
        }else if(fetchBuslist.status == true){
            return res.status(200).send(fetchBuslist);
        }
    }catch(err){
        return res.status(500).send({status:false,message:err.message});
    }
});

router.post("/fetchseatTemplateForBus",
    middleware.api.partner.validatePartner,
    middleware.api.buses.fetchseatTemplateFoBus,
    async(req,res) =>{
        try{
            const fetchSeatTemplate = await controller.getSeatTemplate(req.body.busId);
            if(fetchSeatTemplate.status == false){
                return res.status(500).send(fetchSeatTemplate);
            }else if(fetchSeatTemplate.status == true){
                return res.status(200).send(fetchSeatTemplate);
            }
        }catch(e){
            return res.status(500).send({status:false,message:e.message});
        }
    });

router.post("/updateSeatTemplate",
    middleware.api.partner.validatePartner,
    middleware.api.buses.updateseatTemplate,
    async(req,res)=>{
        try{
            const {busId,updateTemplate} = req.body;
            const updateSeatTemplate = await controller.updateSeatTemplate(req.busDetails,updateTemplate);
            if(updateSeatTemplate.status == false){
                return res.status(500).send(updateSeatTemplate);
            }else if(updateSeatTemplate.status == true){
                return res.status(200).send(updateSeatTemplate);
            }
        }catch(err){
            return res.status(500).send({status:false,message:err.message});
        }
    });

router.post("/fetchBusDetails",
    middleware.api.partner.validatePartner,
    middleware.api.buses.fetchseatTemplateFoBus,
async(req,res)=>{
    try{
        const busDetails = await controller.fetchBusDetails(req.body.busId);
        if(busDetails.status == false){
            return res.status(500).send(busDetails);
        }else if(busDetails.status == true){
            return res.status(200).send(busDetails);
        }
    }catch(err){
        return res.status(500).send({status:false,message:err.message});
    }
});




router.post("/sendQuery",
    middleware.api.common.checkQueriesFrom,
    middleware.api.common.sendQuery,
    async (req,res) =>{
        try{
            const partnerDetails = req.partner ? req.partner :"";
            const sendQuery = await controller.sendQuery(req.body,req.is_partner,partnerDetails);
            if(sendQuery.status == false){
                return res.status(500).send(sendQuery);
            }else if(sendQuery.status == true){
                return res.status(200).send(sendQuery);
            }
        }catch(error){
            return res.status(500).send({status:false,message:error.message});
        }
    });

router.post("/addUserToBus",
    middleware.api.partner.validatePartner,
    middleware.api.buses.addUserToBus,
    async(req,res) =>{
        try{
            const busDetails = req.busDetails;
            const addUserToBus = await controller.addUserToBus(busDetails,req.body);
            if(addUserToBus.status == false){
                return res.status(500).send(addUserToBus);
            }else if(addUserToBus.status == true){
                return res.status(200).send(addUserToBus);
            }
        }catch(err){
            return res.status(500).send({status:false,message:err.message});
        }
    }
)

router.get("/fetchUsersList",
    middleware.api.partner.validatePartner,
    async (req,res) =>{
        try{
            const partner = req.user;
            const fetchUsersList = await controller.fetchUsersListForPartner(partner);
            if(fetchUsersList.status == false){
                return res.status(500).send(fetchUsersList);
            }else if(fetchUsersList.status == true){
                return res.status(200).send(fetchUsersList);
            }
        }catch(err){
            return res.status(500).send({status:false,message:err.message});
        }
    }
)



module.exports = router;