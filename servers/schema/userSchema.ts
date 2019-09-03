var mongoose=require('../Dao/connectDB');
const user=mongoose.Schema({
    _id:{
        type:mongoose.Schema.ObjectId
    },
    name:{
        type:String,
        required: true,
        trim:true,
        unique:true
    },
    pw:{
        type:String,
        trim:true,
        required: true
    },
    avatar:{
        type:String,
        default:'/avatar.png'
    },
    time:{
        type:Date
    }
});
module.exports=mongoose.model('user',user);