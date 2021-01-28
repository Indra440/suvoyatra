const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let queriesSchema = new Schema({
    name:{
        type:String,
        default : "",
        required:false
    },
    subject:{
        type:String,
        default:null,
        required:true
    },
    email:{
        type:String,
        default:null,
        required:true
    },
    mobile:{
        type:String,
        default:null,
        required:true
    },
    message:{
        type:String,
        default:'',
        required:true
    },
    isPartner:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

module.exports = mongoose.model("query",queriesSchema);