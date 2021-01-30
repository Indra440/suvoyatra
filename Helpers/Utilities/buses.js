const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const busModel = require('../../models/buses');


    module.exports.remove_all_images_for_buses = async (files)=>{
        files.front_side ? await unlinkAsync(files.front_side[0].path) : ""
        files.left_side ? await unlinkAsync(files.left_side[0].path) : ""
        files.right_side ? await unlinkAsync(files.right_side[0].path) : ""
        files.back_side ? await unlinkAsync(files.back_side[0].path) : ""
        files.driver_cabin ? await unlinkAsync(files.driver_cabin[0].path) : ""
        files.entire_inside ? await unlinkAsync(files.entire_inside[0].path) : ""
        return true;
    }

    module.exports.convertTime12to24 = async (time12h) =>{
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":");
        if (hours === "12") {
          hours = "00";
        }
        if (modifier === "PM") {
          hours = parseInt(hours, 10) + 12;
        }
        return `${hours}:${minutes}`;
    }

    module.exports.calculateFare = async () =>{

    }

    module.exports.fetchLocationList = async () =>{
        try{
          const fetchLocationList = await busModel.aggregate([
            {
              $match:{
                is_active : true
              }
            },
            {
              $project:{
                _id:1,
                busRoadMap : 1
              }
            },
            {
                $unwind:{
                    path:"$busRoadMap.viaRoot",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
              $group:{
                  _id:"$_id",
                   journeyForm:{
                           $first:"$busRoadMap.journeyForm"
                           },
                   journeyTo:{
                          $first:"$busRoadMap.journeyTo"
                    },
                   viaRoot:{
                          $addToSet:"$busRoadMap.viaRoot"
                    }   
                  }
          }
        ])
        if(! fetchLocationList ){
          return false;
        }
        return fetchLocationList;
        }catch(err){
          return false;
        }
    }