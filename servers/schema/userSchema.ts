var mongoose=require('../Dao/connectDB');
const user=mongoose.Schema({
    _id:{
        type:mongoose.Schema.ObjectId
    },
    name:{
        type:String,
        trim:true,
        unique:true
    },
    pw:{
        type:String,
        trim:true
    },
    avatar:{
        type:String,
        default:'/avatar.png'
    },
    time:{
        type:Date
    }
});
user.virtual('info').get(function(this:any){
    return {'id':this._id,'name':this.name,'avatar':this.avatar}
})
module.exports=mongoose.model('user',user);