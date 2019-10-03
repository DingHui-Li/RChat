var mongoose =require('../Dao/connectDB')
const think=mongoose.Schema({
    user:{
        type:String,
        required:true,
        ref:'user'
    },
    content:{
        type:String
    },
    time:Date,
    isPublic:{
        type:Boolean,
        default:true
    },
    imgs:{
        type:Array,
        default:[]
    },
    remind:{
        type:Array,
        default:[]
    }
})
module.exports=mongoose.model('think',think);