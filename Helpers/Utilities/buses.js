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
    console.log("Departure date ",departure_date);
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
              $unwind:{
                path:"$bookingDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
                $project:{
                    _id:1,
                    totalseat : "$busFeature.noOfSeat",
                    seatTemplate : "$seatTemplate",
                    bookingDetails : 1,
                    bookingDates : {$cond:{ if: { $eq: [ "$bookingDetails", null ] }, then: null, else:
                                {"bookingDateYear" : { $year: "$bookingDetails.bookingFor" },
                                "bookingDateMonth": { $month: "$bookingDetails.bookingFor" },
                                "bookingDateDay": { $dayOfMonth: "$bookingDetails.bookingFor" }}
                                 }},
                }
            },
            {
              $project:{
                          _id:1,
                          totalseat : 1,
                          seatTemplate : 1,
                          bookingDetails : {$cond:{ if: {
                              $and:[
                                  { $ne: [ "$bookingDetails", null ] },
                                  { $eq:["$bookingDates.bookingDateYear" , Number(String(departure_date).split("-")[0])]},
                                  { $eq:["$bookingDates.bookingDateMonth" , Number(String(departure_date).split("-")[1])]},
                                  { $eq:["$bookingDates.bookingDateDay" , Number(String(departure_date  ).split("-")[2])]},
                                  { $eq:["$bookingDetails.bookingStatus","confirmed"]}
                              ]}, then: "$bookingDetails", else:null}
                          }
                      } 
          },
            {
                $project:{
                        _id:1,
                        totalseat : 1,
                        seatTemplate :1,
                        bookedSeat:{
                                $cond:{if:{$eq:["$bookingDetails",null]},
                                            then:[],else:"$bookingDetails.bookingSeat"}
                            }
                    }
            },
            {
              $group:{
                _id:"$_id",
                totalseat : {$first:"$totalseat"},
                seatTemplate : {$first:"$seatTemplate"},
                bookedSeat : {$addToSet:"$bookedSeat"}
              }
            }
        ])
        console.log("bookingDetails ",bookingDetails);
          let bookedseats = bookingDetails[0].bookedSeat;
          console.log("bookedseats ",bookedseats);
          let finalBookedSeat = [];
          if(bookedseats && bookedseats.length > 0 ){
            bookedseats.map(async (cur_booking,index)=>{
              cur_booking.map((cur_seat,index)=>{
                finalBookedSeat.push(cur_seat)
              })
            })
            console.log("finalBookedSeat ",finalBookedSeat);
          }
        bookingDetails[0].bookedSeat = JSON.stringify(finalBookedSeat);
        resolve({status:true,bookingDetails:bookingDetails}) 
      }catch(err){
        console.log("Its hitting catch here ",err);
        reject({status:false,bookingDetails:err})
      }
    })
  }