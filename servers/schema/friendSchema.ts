var mongoose =require('../Dao/connectDB')

const friendList=new mongoose.Schema({
    user:[{
        type:mongoose.Schema.ObjectId,
        ref:'user',
    }],
    friend:[{
        type:mongoose.Schema.ObjectId,
        ref:'user'
    }],
    time:Date
},{autoIndex:false})
module.exports=mongoose.model('friendList',friendList);