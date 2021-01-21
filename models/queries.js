const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let queriesSchema = new Schema({
    name:{
        type:String,
        ref:''
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
        default:'one way',
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
})

module.exports = mongoose.model("query",queriesSchema);