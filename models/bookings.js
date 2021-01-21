const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let bookigsSchema = new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'user'
    },
    pickupLocation:{
        type:String,
        default:null,
        required:true
    },
    dropLocation:{
        type:String,
        default:null,
        required:true
    },
    returnProcess:{
        type:String,
        default:'one way',
        required:true
    },
    busId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    bookingAmmount:{
        type:Number,
        required:true
    },
    bookingStatus:{
        type:String,
        default:'pending'  // pending,running,completed
    },
    passengersDetails:[{
        passengerName:{
            type:String,
            required:true
        }
    }]
})

module.exports = mongoose.model("booking",bookigsSchema);