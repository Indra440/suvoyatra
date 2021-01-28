const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let usersSchema = new Schema({
    userName:{
        type:Schema.Types.ObjectId,
        ref:''
    },
    user_Ph_Number:{
        type:String,
        default:null,
        required:true
    },
    userEmail:{
        type:String,
        default:null,
        required:true
    },
    password:{
        type:String,
        default:'one way',
        required:true
    },
    streetAddress:{
        type:String,
        default:''
    },
    zipCode:{
        type:String,
        default:''
    },
    city:{
        type:String,
        default:''
    },
    otpVerification:{
        current_otp:{
            type:String,
            default : null,
            required :false
        },
        otp_generation_time:{
            type:Date,
            default : null,
            required:false
        }
    }
},{
    timestamps:true
})

module.exports = mongoose.model("user",usersSchema);