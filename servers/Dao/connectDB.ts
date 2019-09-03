var mongoose=require('mongoose');
const connectUrl="mongodb://root:sad12345@47.106.211.38:27017/rchat?retryWrites=true&w=majority";
const options={
    useNewUrlParser:true
}
console.log('正在连接mongoDB...');
mongoose.connect(connectUrl,options);
mongoose.connection.on('connected',function(){
    console.log('mongoDB连接成功!');
})
mongoose.connection.on('error',function(err:any){
    console.log('mongoDB连接错误：'+err);
})
mongoose.connection.on('disconnected',function(){
    console.log('mongoDB断开连接');
})
mongoose.set('useFindAndModify', false);
module.exports=mongoose;