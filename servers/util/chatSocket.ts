
var mongoose=require('../Dao/connectDB')
var Chat=require('../schema/chatSchema')

import chatDao from'../Dao/chatDao'
var cd=new chatDao();

var ChatList=require('../schema/chatListSchema')
import chatListDao from '../Dao/chatListDao'
var cld=new chatListDao();

import socketDao from '../Dao/socketDao'
var skd=new socketDao();

import applyDao from '../Dao/applyDao'
var ad=new applyDao();

import userDao from '../Dao/userDao'
var ud=new userDao();

import friendDao from '../Dao/friendDao'
var fd=new friendDao();

export default async function chatSocket(socket:any){
    socket.on('to',async function(data:any,callback:any){//接受消息
        let isFriend=await fd.isFriend(data.userid,data.friendid);

        if(!isFriend.isFriend) return callback({'code':400,'msg':'你不是对方的好友'});
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
        let updateResult_to=await cld.addChatList(chatList_to);//更新发送者chatlist
        let updateResult_from=await cld.addChatList(chatList_from);//更新接收者chatlist    
        let saveResult=await cd.newMsg(chat);//保存消息
        saveResult.listData=updateResult_to.data;
        callback(saveResult); //回调====更新发送者的前端数据

        let socketid=await skd.get(data.friendid);
        if(socketid!==""){//friend在线
            socket.to(socketid).emit('from',{'code':200,'data':saveResult.msgData,'listData':updateResult_from.data});//转发,data:chat数据，listData：chatlist数据
        }
    });

    socket.on('apply',function(data:any,callback:Function){//好友申请
        ad.add(data.user,data.friend).then(async result=>{
                callback(result);
                if(result.code===200){//若是新的请求
                    let socketid=await skd.get(data.friend);
                    if(socketid){//若对方在线
                        let user=await ud.getInfo(result.result.user);
                        socket.to(socketid).emit('newApply',{'user':user.data,'data':result.result});//发送请求者用户信息
                    }
                }
            })
    })

    socket.on('receive',function(data:any){
        cld.clearMsgNum(data.userid,data.friendid);
    })

    socket.on('newConnect',function(data:any,callback:Function){//用户新连接
        //addSocketId(data.userid,socket.id)//保存对应的userid和socketid
        skd.add(data.userid,socket.id).then(data=>{
            if(data.code===500){
                socket.to(socket.id).emit('disconnect');
            }else{
                socket.to(socket.id).emit('connect');
            }
        })
    });

    socket.on('call',async function(data:any){
        let socketid=await skd.get(data.friendid);
        if(socketid){
            socket.to(socketid).emit('call',{'action':data.action})
        }
    });
    socket.on('sendOffer',async function(data:any){
        let socketid=await skd.get(data.friendid);
        if(socketid){
            socket.to(socketid).emit('offer',{'candidate':data.candidate,'sdp':data.sdp});
        }
    });
    socket.on('sendAnswer',async function(data:any){
        let socketid=await skd.get(data.friendid);
        if(socketid){
            socket.to(socketid).emit('answer',{'candidate':data.candidate,'sdp':data.sdp});
        }
    });
    // =============================================
    socket.on('connect',function(){
        console.log(socket.id+' 建立连接');
    })
    socket.on('disconnect',function(reason:any){
        skd.removeBySid(socket.id);
        console.log(socket.id+' 断开连接;原因'+reason);
    })
    socket.on('error',function(err:any){
        console.log(err);
    })
}

// function addSocketId(userid:String,socketid:String){
//     let exist:boolean=false;
//     let index=-1;
//     for(let i=0;i<socketData.length;i++){
//         if(socketData[i].userid===userid){
//             exist=true;
//             index=i;
//             break;
//         }
//     }
//     if(exist){
//         socketData[index].socketid=socketid;
//     }else{
//         socketData.push({'userid':userid,'socketid':socketid});
//     }
// }

// function getSocketId(friendid:string):string{
//     for(let i=0;i<socketData.length;i++){
//         if(socketData[i].userid===friendid){
//             return socketData[i].socketid;
//         }
//     }
//     return "";
// }