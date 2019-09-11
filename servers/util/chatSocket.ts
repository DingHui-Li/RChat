import io from '../app'
var Chat=require('../schema/chatSchema')
var ChatList=require('../schema/chatListSchema')
var mongoose=require('../Dao/connectDB')
import chatDao from'../Dao/chatDao'
var cd=new chatDao();
import chatListDao from '../Dao/chatListDao'
var cld=new chatListDao();

const socketData=new Array();

export default function chatSocket(socket:any){
    socket.on('to',async function(data:any,callback:any){//接受消息
        let chat=new Chat({
            _id:mongoose.Types.ObjectId(),
            userid:data.userid,
            friendid:data.friendid,
            chat:data.msg,
            time:new Date(),
            type:data.type
        })

        let chatList_to=new ChatList({//发送者
            userid:data.userid,
            friendid:data.friendid,
            latelyChat:data.msg,
            time:new Date(),
            type:data.type
        }); 
        let newMsgNum=await cld.getNewMsgNum(data.friendid,data.userid);//获取未读消息数
        let chatList_from=new ChatList({//接受者
            userid:data.friendid,
            friendid:data.userid,
            latelyChat:data.msg,
            time:new Date(),
            newMsgNum:newMsgNum+1,
            type:data.type
        });
        let updateResult_to=await cld.addChatList(chatList_to);//更新chatlist
        let updateResult_from=await cld.addChatList(chatList_from);        
        let saveResult=await cd.newMsg(chat);//保存到数据库
        saveResult.listData=updateResult_to.data;
        callback(saveResult); //回调

        let socketid=getSocketId(data.friendid);
        if(socketid!==""){//friend在线
            socket.to(socketid).emit('from',{'code':200,'data':saveResult.msgData,'listData':updateResult_from.data,'offer':data.offer});//转发,data:chat数据，listData：chatlist数据
        }
    });
    socket.on('receive',function(data:any){
        cld.clearMsgNum(data.userid,data.friendid);
    })
    socket.on('newConnect',function(data:any){//用户新连接
        addSocketId(data.userid,socket.id)//保存对应的userid和socketid
    });
    socket.on('call',function(data:any){
        let socketid=getSocketId(data.friendid);
        console.log(data);
        if(socketid){
            socket.to(socketid).emit('call',{'action':data.action,'answer':data.answer})
        }
    });
    socket.on('iceCandidate',function(data:any){
        let socketid=getSocketId(data.friendid);
        if(socketid){
            socket.to(socketid).emit('iceCandidate',{'iceCandidate':data.iceCandidate});
        }
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

function getSocketId(friendid:string):string{
    for(let i=0;i<socketData.length;i++){
        if(socketData[i].userid===friendid){
            return socketData[i].socketid;
        }
    }
    return "";
}