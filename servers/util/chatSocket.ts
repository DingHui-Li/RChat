var Chat=require('../schema/chatSchema')
var mongoose=require('../Dao/connectDB')
import chatDao from'../Dao/chatDao'
let cd=new chatDao();

const socketData=new Array();
export default function chatSocket(socket:any){
    socket.on('to',async function(data:any,callback:any){//接受消息
        let chat=new Chat({
            _id:mongoose.Types.ObjectId(),
            userid:data.userid,
            friendid:data.friendid,
            chat:data.msg,
            time:new Date()
        })
        let response=await cd.newMsg(chat);//保存到数据库
        callback(response); //回调

        let socketid=getSocketId(data.friendid);
        if(socketid!==""){//friend在线
            socket.to(socketid).emit('from',{'data':response.data});//转发
        }
    });
    socket.on('newConnect',function(data:any){//用户新连接
        addSocketId(data.userid,socket.id)//保存对应的userid和socketid
    });
    // =============================================
    socket.on('connect',function(){
        console.log(socket.id+' 建立连接');
    })
    socket.on('disconnect',function(reason:any){
        console.log(socket.id+' 断开连接;原因'+reason);
    })
    socket.on('error',function(err:any){
        console.log(err);
    })
}

function addSocketId(userid:String,socketid:String){
    let exist:boolean=false;
    let index=-1;
    for(let i=0;i<socketData.length;i++){
        if(socketData[i].userid===userid){
            exist=true;
            index=i;
            break;
        }
    }
    if(exist){
        socketData[index].socketid=socketid;
    }else{
        socketData.push({'userid':userid,'socketid':socketid});
    }
}

function getSocketId(friendid:String):String{
    for(let i=0;i<socketData.length;i++){
        if(socketData[i].userid===friendid){
            return socketData[i].socketid;
        }
    }
    return "";
}