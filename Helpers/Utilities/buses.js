const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const busModel = require('../../models/buses');
const mongoose = require('mongoose');


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

  module.exports.fetchBookedSeat = async (bus_id,departure_date)=>{
    return new Promise( async (resolve,reject)=>{
        try{
          const bookingDetails = await busModel.aggregate([
            {
                $match:{
                    _id:mongoose.Types.ObjectId(String(bus_id)),
                    is_active : true
                }
            },
            {
                $lookup:{
                    from: "bookings",
                    localField : "_id",
                    foreignField: "busId",
                    as: "bookingDetails"
                }
            },
            {
                $project:{
                    _id:1,
                    totalseat : "$busFeature.noOfSeat",
                    seatTemplate : "$seatTemplate",
                    bookingDetails : {
                        $filter:{
                            input: "$bookingDetails",
                            as: "booking",
                            cond: { $eq: [ "$$booking.bookingFor", new Date(departure_date) ] }
                        }
                    }
                }
            },
            {
                $project:{
                        _id:1,
                        totalseat : 1,
                        seatTemplate :1,
                        bookedSeat:{
                                $cond:{if:{$gte:[{$size:"$bookingDetails"},1]},
                                            then:{ $map:{ input: "$bookingDetails", as: "booking", in:{$sum: "$$booking.bookingSeatNo" }}},else:[]}
                            }
                    }
            }
        ])
        resolve({status:true,bookingDetails:bookingDetails}) 
      }catch(err){
        reject({status:false,bookingDetails:err})
      }
    })
  }