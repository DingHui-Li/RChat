var mongoose=require('../Dao/connectDB')
var chatListSchema=mongoose.Schema({
    _id:{
        type:mongoose.Schema.ObjectId
    },
    user:String,
    friend:[{
        type:String,
        ref:'user'
    }],
    time:Date,
    latelyChat:[{
        type:String,
        ref:'chat'
    }]
});
module.exports=mongoose.Model('chatList',chatListSchema);