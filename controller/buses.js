
const fs = require('fs');
const _helper = require('../Helpers/helpers');
const busModel = require('../models/buses');
const mongoose = require('mongoose'); 

const addBus = async (user,busDetails,files) =>{
    let response = {
        status:false,
        message : "",
        payload:{}
    }
    try{
        const {busName,busnumber,journeyForm,journeyTo,departureTime,
            arrivalTime,viaRoot1,viaRoot2,noOfSeat,busType,acType,multimediaType,busDescription} = busDetails;
            const noSpaceName = busName.replace(/\s/g, "_");
        const partner_id = "5fe50000311b013e741f339d";
        const front_side_fileContents = files.front_side_fileContent;
        let front_side_key = `busimages/${partner_id}-${partner_id}-${noSpaceName}-front_side.png`;
        var front_side_image_link = await _helper.utility.common.uploadImageToImagekit(front_side_fileContents,front_side_key)
        if(!front_side_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const left_side_fileContents = files.left_side_fileContent;
        let left_side_key = `busimages/${partner_id}-${partner_id}-${noSpaceName}-left_side.png`;
        var left_side_image_link = await _helper.utility.common.uploadImageToImagekit(left_side_fileContents,left_side_key)
        if(!left_side_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const right_side_fileContents = files.right_side_fileContent;
        let right_side_key = `busimages/${partner_id}-${partner_id}-${noSpaceName}-right_side.png`;
        var right_side_image_link = await _helper.utility.common.uploadImageToImagekit(right_side_fileContents,right_side_key)
        if(!right_side_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const back_side_fileContents = files.back_side_fileContent;
        let back_side_key = `busimages/${partner_id}-${partner_id}-${noSpaceName}-back_side.png`;
        var back_side_image_link = await _helper.utility.common.uploadImageToImagekit(back_side_fileContents,back_side_key)
        if(!back_side_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const driver_cabin_fileContent = files.driver_cabin_fileContent;
        let driver_cabin_key = `busimages/${partner_id}-${partner_id}-${noSpaceName}-driver_cabin.png`;
        var driver_cabin_image_link = await _helper.utility.common.uploadImageToImagekit(driver_cabin_fileContent,driver_cabin_key)
        if(!driver_cabin_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
        const entire_inside_fileContent = files.entire_inside_fileContent;
        let entire_inside_key = `busimages/${partner_id}-${partner_id}-${noSpaceName}-entire_inside.png`;
        var entire_inside_image_link = await _helper.utility.common.uploadImageToImagekit(entire_inside_fileContent,entire_inside_key)
        if(!entire_inside_image_link){
            response.message = "Error occur while uploading files"
            return response;
        }
    
        const payload = {
            partnetId: mongoose.Types.ObjectId(partner_id),
            busName : busName,
            busNumber : busnumber,
            busRoadMap:{
                journeyForm : journeyForm,
                journeyTo : journeyTo,
                viaRoot1 : viaRoot1,
                viaroot2 : viaRoot2
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
            response.status = true,
            response.message = "Bus added successfully",
            response.payload = addBus;
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
        payload:[]
    }
    try{
        const pertnerId = user._id;
        const busList = await busModel.find({_id:mongoose.Types.ObjectId(pertnerId),busStatus:'active'})
        if(!busList){
            response.message = "Error occured while getting bus list"
            return response;
        }
        response.message = "Buslist fetch successfully";
        return response;
    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

module.exports = {
    addBus,
    getBuslist
}