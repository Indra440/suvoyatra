
const fs = require('fs');
const _helper = require('../Helpers/helpers');
const busModel = require('../models/buses');
const mongoose = require('mongoose');
const queryModel = require('../models/queries');

const addBus = async (user,busDetails,files) =>{
    let response = {
        status:false,
        message : "",
    }    
    try{
        console.log("busDetails ",busDetails);
        const {busName,busnumber,journeyForm,journeyTo,departureTime,
            arrivalTime,viaRoot,noOfSeat,busType,acType,multimediaType,busDescription} = busDetails;
            const noSpaceName = busName.replace(/\s/g, "_");
        const partner_id = user._id;
        const front_side_fileContents = files.front_side_fileContent;
        let front_side_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-front_side.png`;
        var front_side_image_link = await _helper.utility.common.uploadImageToImagekit(front_side_fileContents,front_side_key)
        if(!front_side_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const left_side_fileContents = files.left_side_fileContent;
        let left_side_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-left_side.png`;
        var left_side_image_link = await _helper.utility.common.uploadImageToImagekit(left_side_fileContents,left_side_key)
        if(!left_side_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const right_side_fileContents = files.right_side_fileContent;
        let right_side_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-right_side.png`;
        var right_side_image_link = await _helper.utility.common.uploadImageToImagekit(right_side_fileContents,right_side_key)
        if(!right_side_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const back_side_fileContents = files.back_side_fileContent;
        let back_side_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-back_side.png`;
        var back_side_image_link = await _helper.utility.common.uploadImageToImagekit(back_side_fileContents,back_side_key)
        if(!back_side_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const driver_cabin_fileContent = files.driver_cabin_fileContent;
        let driver_cabin_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-driver_cabin.png`;
        var driver_cabin_image_link = await _helper.utility.common.uploadImageToImagekit(driver_cabin_fileContent,driver_cabin_key)
        if(!driver_cabin_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const entire_inside_fileContent = files.entire_inside_fileContent;
        let entire_inside_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-entire_inside.png`;
        var entire_inside_image_link = await _helper.utility.common.uploadImageToImagekit(entire_inside_fileContent,entire_inside_key)
        if(!entire_inside_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const payload = {
            partnerId: mongoose.Types.ObjectId(partner_id),
            busName : busName,
            busNumber : busnumber,
            busRoadMap:{
                journeyForm : journeyForm,
                journeyTo : journeyTo,
                viaRoot : JSON.parse(viaRoot)
            },
            busTiming :{
                departureTime : departureTime,
                arrivalTime : arrivalTime
            },
            busFeature : {
                noOfSeat : Number(noOfSeat),
                busType : busType,
                acType : acType,
                multimediaType : multimediaType
            },
            busDescription:busDescription,
            busImages:{
                front_side : front_side_image_link,
                left_side : left_side_image_link,
                right_side : right_side_image_link,
                back_side : back_side_image_link,
                driver_cabin : driver_cabin_image_link,
                entire_inside : entire_inside_image_link
            }
        }

        let model = new busModel(payload);
        console.log("payload ",payload);
        const addBus = await model.save();
            if(!addBus){
                response.message = "Error occur while adding buses"
                return response;
            }
            console.log("addBus ",addBus);
            response.status = true;
            response.message = "Bus added successfully";
            console.log("Response is here ",response);
            return response;
    }catch(err){
        response.message = "Error occured while creating bus";
        response.payload = err;
        return response;
    }
}

const getBuslist = async (user) =>{
    let response = {
        status:false,
        message : "",
    }    
    try{
        const pertnerId = user._id;
        console.log("Partner id",pertnerId);
        const busList = await busModel.find({partnerId:mongoose.Types.ObjectId(pertnerId),busStatus:'active'})
        if(!busList){
            response.message = "Error occured while getting bus list"
            return response;
        }
        response.status = true;
        response.message = "Buslist fetch successfully";
        response.payload = busList;
        return response;
    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

const getSeatTemplate = async(busId) =>{
    let response = {
        status:false,
        message : "",
    }    
    try{
        const getSeatTemplate = await busModel.findOne({_id:mongoose.Types.ObjectId(busId),is_active:true});
        if(!getSeatTemplate){
            response.message = "Bus not found"
            return response;
        }
        console.log("getSeatTemplate.seatTemplate",getSeatTemplate.seatTemplate);
        if(!getSeatTemplate.seatTemplate || getSeatTemplate.seatTemplate == null || getSeatTemplate.seatTemplate == undefined){
            response.status = false;
            response.message = "No seat Template has set for this bus !!! Please choose one seat template.";
            return response;
        }
            response.status = true;
            response.message = "Bus template fetched successfully";
            response.payload = {
                "template":getSeatTemplate.seatTemplate
            };
            return response;
    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

const updateSeatTemplate= async(busdetails,updateTemplate) =>{
    let response = {
        status:false,
        message : "",
    }    
    try{
        console.log("busdetails here ",busdetails);
        busdetails.seatTemplate = updateTemplate;
        let upadateTemplate = await busdetails.save();
        if(!upadateTemplate){
            response.status = false;
            response.message = "Error occur while updating seat template. Please try again after some time";
            return response;
        }
        response.status = true;
        response.message = "Seat template updated successfully";
        response.payload = {
            "template":busdetails.seatTemplate
        };
        return response;
    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

const sendQuery = async(queryDetails,is_partner)=>{
    let response = {
        status:false,
        message : "",
    }
    try{
        var {name,phone,email,subject,message} = queryDetails;
        const payload = {
            name : (name && name !="") ? name : "",
            mobile : phone,
            email : email,
            subject : subject,
            message :message,
            isPartner : is_partner
        }
        let model = new queryModel(payload);
        let saveQuery = await model.save();
        if(!saveQuery){
            response.message = "Error occur while adding buses"
            return response;
        }
        response.status = true;
        response.message = "Query saved successfully";
        return response;

    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

const addUserToBus = async(busDetails,userDetails) =>{
    let response = {
        status:false,
        message : "",
    }
    try{
        console.log("Bus details ",busDetails);
        const{busId,name,mobileNo,scenario} = userDetails;
        let payload = {
            name : name,
            mobile : mobileNo,
        }
        console.log("Payload ",payload);
        scenario == "driver" ? busDetails.drivers.push(payload) : scenario == "conductor" ? busDetails.conductors.push(payload) :"";
        console.log("After changing bus details ",busDetails);
        await busDetails.save();
        response.status = true;
        response.message = scenario + " added successfully";
        return response;
    }catch(err){
        console.log("Error!!!! ",err);
        response.message = "Error occured while adding user";
        response.payload = err;
        return response;
    }
}

module.exports = {
    addBus,
    getBuslist,
    getSeatTemplate,
    updateSeatTemplate,
    sendQuery,
    addUserToBus
}