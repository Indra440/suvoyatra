const mongoose = require("mongoose");
var Schema = mongoose.Schema;
const {nanoid}  = require("nanoid");

let bookigsSchema = new Schema({
    ticketNo :{
       type:String,
       required:false,
       default: nanoid(8).toUpperCase()
    },
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
        default:'pending',  // pending,confirmed
        required:false
    },
    bookingFor:{
        type:Date,
        default:new Date(),
        required:false
    },
    razorpayOrderId:{
        type:String,
        default:null,
        required:false
    },
    bookingSeat:[{
        seatId:{
            type:String,
            required:true
        },
        seatNo:{
            type:String,
            required:true
        }
    }],
    passengersDetails:[{
        passengerName:{
            type:String,
            required:true
        },
        passengerAge:{
            type:String,
            required:true
        }
    }],
    ticketFor:{
        email:{
            type:String,
            required:false,
            default:null
        },
        mobile_no:{
            type:String,
            required:false,
            default:null
        }
    }
},{
    timestamps:true
})

module.exports = mongoose.model("bookings",bookigsSchema);