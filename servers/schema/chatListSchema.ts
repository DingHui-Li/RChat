var mongoose=require('../Dao/connectDB')
var chatListSchema=mongoose.Schema({
    _id:false,
    userid:{
        type:String,
        required: true
    },
    friendid:[{
        type:String,
        required: true,
        ref:'user'
    }],
    time:Date,
    latelyChat:String,
    type:{
        type:String,
        default:'text'
    },
    newMsgNum:{
        type:Number,
        default:0
    }
});
module.exports=mongoose.model('chatList',chatListSchema);