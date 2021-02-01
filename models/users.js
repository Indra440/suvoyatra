const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let usersSchema = new Schema({
    user_Ph_Number:{
        type:String,
        default:null,
        required:false
    },
    userEmail:{
        type:String,
        default:null,
        required:false
    },
    userName:{
        type:String,
        default:null,
        required:false
    },
    // password:{
    //     type:String,
    //     default:'one way',
    //     required:true
    // },
    streetAddress:{
        type:String,
        default:'',
        required:false
    },
    zipCode:{
        type:String,
        default:'',
        required:false
    },
    city:{
        type:String,
        default:'',
        required:false
    },
    is_active:{
        type:Boolean,
        default:true,
        required:false
    },
    Verification:{
        last_otp:{
            type:String,
            default : null,
            required :false
        },
        otp_generation_time:{
            type:Date,
            default : null,
            required:false
        },
        verified :{
            type:Boolean,
            default:false,
            required:false
        }
    }
},{
    timestamps:true
})

module.exports = mongoose.model("user",usersSchema);