var mongoose=require('../Dao/connectDB');
const user=mongoose.Schema({
    name:String,
    pw:String
});
user.virtual('info').get(function(this:any){
    return this.name+'---'+this.pw;
})
module.exports=mongoose.model('user',user);