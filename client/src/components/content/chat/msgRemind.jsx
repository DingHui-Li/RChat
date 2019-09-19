import React,{ useEffect } from 'react'
import {Avatar,Fade,ButtonBase,Paper} from '@material-ui/core'
import {CallEnd,Phone,HighlightOff} from '@material-ui/icons'
import{imgHost,chatSocket,iceServers} from '../../../config'
import {useSnackbar} from 'notistack'
import {globalContext} from '../../../index'
import {timeParse} from '../../../util/timeUtil'
import {updateChatList} from '../../../util/arrayUtil'
// import {useMsgData} from '../../../context/msgContext'
// import {useChatList} from '../../../context/chatListContext'
// import {useVA} from '../../../context/VAContext'
import {initMediaStream} from '../../../util/getMediaStream'
import {useApp} from '../../../context/appContext'


export default function MsgRemind(){
    const userInfo=React.useContext(globalContext).userInfo;        
    const {enqueueSnackbar,closeSnackbar} =useSnackbar();
    const {chatList_data,update_chatListData,chatList_selected,update_chatListSelected}=useApp();
    const {update_VAState}=useApp();
    const {setNewMsgData}=useApp();

    const [newChatData,setNewChatData]=React.useState(null);
    const [snackBarKey,setSnackBarKey]=React.useState(null);
    useEffect(()=>{
        chatSocket.on('call',function(data){
            if(data.action==='called'){
                
            }else{  
                closeSnackbar(snackBarKey);
                let stream= document.getElementById('selfVideo').srcObject;
                if(stream){
                    stream.getTracks().forEach(function(track){
                        track.stop();
                    });
                };
                window.rpc.getSenders().forEach(sender=>{
                    window.rpc.removeTrack(sender);
                })
                window.rpc.getReceivers().forEach(receiver=>{
                    receiver.track.stop()
                })
                window.rpc.close();
                window.rpc=new RTCPeerConnection(iceServers);
            }
            update_VAState(data.action)
        });

        window.rpc=new RTCPeerConnection(iceServers);
        chatSocket.on('offer',async function(data){
            if(!window.rpc)return;
            console.log('offer');
            if(!window.rpc.remoteDescription) await window.rpc.setRemoteDescription(new RTCSessionDescription(data.sdp)).catch(err=>{
                console.log(err);
            });
            window.rpc.addIceCandidate(data.candidate).catch(err=>{
                console.log(err);
            }); 
        })     

        return ()=>{
            chatSocket.off('call');
            chatSocket.off('offer');
        }
    },[]);
    function snackBar(data,key){
        return (
            <Paper style={{padding:'0',minWidth:'300px',cursor:'pointer',borderRadius:'10px'}}  elevation={5}>
                <div style={{borderBottom:'1px solid #e0e0e0',padding:'10px'}} onClick={()=>{
                                                                                            update_chatListSelected(data.listData.friendid[0]);
                                                                                            closeSnackbar(key);
                                                                                        }}>
                    <Avatar src={imgHost+data.listData.friendid[0].avatar} style={{width:'23px',height:'23px',float:'left'}}></Avatar>
                    <div style={{display:'inline-block',lineHeight:'23px',marginLeft:'5px',fontWeight:'bold'}}>
                        <div> {data.listData.friendid[0].name}</div>
                    </div>
                    <div style={{fontWeight:'normal',fontSize:'10px',float:'right'}}>{timeParse(data.data.time)}</div>
                </div>
                <div style={{padding:'10px',overflow: 'hidden',whiteSpace: 'nowrap',textOverflow: 'ellipsis',marginLeft:'28px'}}>
                    <span onClick={()=>{
                                    update_chatListSelected(data.listData.friendid[0]);
                                    closeSnackbar(key);
                                }}>
                        {data.data.chat.substring(0,35)}
                    </span>
                    <div style={{float:'right'}} onClick={()=>{closeSnackbar(key);}}> <HighlightOff /></div> 
                </div>
            </Paper>
        )
    }

    function snackBar2VA(data,key){
        return(
            <Paper style={{padding:'0',minWidth:'300px',cursor:'pointer',borderRadius:'10px'}}  elevation={5}>
                <div style={{borderBottom:'1px solid #e0e0e0',padding:'10px'}}>
                    <Avatar src={imgHost+data.listData.friendid[0].avatar} style={{width:'23px',height:'23px',float:'left'}}></Avatar>
                    <div style={{display:'inline-block',lineHeight:'23px',marginLeft:'5px',fontWeight:'bold'}}>
                        <div> {data.listData.friendid[0].name}</div>
                    </div>
                    <div style={{fontWeight:'normal',fontSize:'10px',float:'right'}}>{timeParse(data.data.time)}</div>
                </div>
                <div style={{padding:'10px',overflow: 'hidden',whiteSpace: 'nowrap',textOverflow: 'ellipsis',marginLeft:'28px'}}>
                    <ButtonBase style={{backgroundColor:'#D32F2F',borderRadius:'50%',width:'40px',height:'40px'}} 
                        onClick={()=>{
                            closeSnackbar(key);
                            chatSocket.emit('call',{'action':'callend','userid':userInfo._id,'friendid':data.data.userid});
                            window.rpc.getSenders().forEach(sender=>{
                                window.rpc.removeTrack(sender);
                            })
                            window.rpc.close();
                            window.rpc=new RTCPeerConnection(iceServers);
                            update_VAState('callend');
                            }}>
                        <CallEnd style={{width:'30px',height:'30px',color:'#fff'}}/>
                    </ButtonBase>
                    <ButtonBase style={{backgroundColor:'#4CAF50',borderRadius:'50%',width:'40px',height:'40px',marginLeft:'20px'}} 
                        onClick={async ()=>{ 
                            update_VAState('called');
                            let stream=await initMediaStream();
                            if(!stream){
                                enqueueSnackbar('无可用的视频输入流',{variant:'error'});
                                return;
                            }
                            document.getElementById('selfVideo').srcObject=stream;
                            window.rpc.addTrack(stream.getVideoTracks()[0],stream);
                            if(!window.rpc.remoteDescription) window.rpc.setRemoteDescription(new RTCSessionDescription(data.offer));
                            await window.rpc.createAnswer().then(function(answer){
                                chatSocket.emit('sendAnswer',{'friendid':data.data.userid,'candidate':'','sdp':answer});
                                window.rpc.setLocalDescription(new RTCSessionDescription(answer));//接收端 answer（snackbar）
                            });                  
                            let newStream=new MediaStream();
                            newStream.addTrack(window.rpc.getReceivers()[0].track);
                            document.getElementById('videoChat').srcObject=newStream;
                            window.rpc.onicecandidate=function(event){
                                if(event.candidate&&event.candidate.candidate){
                                    chatSocket.emit('sendAnswer',{'friendid':data.data.userid,'candidate':event.candidate,'sdp':window.rpc.localDescription});
                                }
                            };     
                            update_chatListSelected(data.listData.friendid[0]);
                            closeSnackbar(key);
                            chatSocket.emit('call',{'action':'called','userid':userInfo._id,'friendid':data.data.userid,'answer':window.rpc.localDescription});
                    
                        }}>
                        <Phone style={{width:'30px',height:'30px',color:'#fff'}}/>
                    </ButtonBase>
                    <div style={{float:'right'}}>
                        <ButtonBase style={{borderRadius:'50%',width:'40px',height:'40px'}} onClick={()=>{ closeSnackbar(key);}}>
                            <HighlightOff />
                        </ButtonBase>
                    </div> 
                </div>
            </Paper>
        )
    }
        useEffect(()=>{  //监听接受的消息
            chatSocket.off('from');console.log('监听')
            chatSocket.on('from',data=>{  
                        update_VAState('false');
                        if(data.data.type==='video'){ 
                            console.log('接收到连接请求')
                            let key= enqueueSnackbar('',{
                                persist:true,
                                variant:'info',
                                anchorOrigin:{
                                    horizontal:'right',
                                    vertical:'top'
                                },
                                children:(key)=>(
                                    snackBar2VA(data,key)
                                )
                            });
                            setSnackBarKey(key);
                        
                            if(data.data.userid===chatList_selected._id){
                                data.listData.newMsgNum=0;
                                setNewMsgData(data.data);
                                chatSocket.emit('receive',{'userid':userInfo._id,'friendid':chatList_selected._id});//确认消息
                            }
                        }else{
                            if(data.data.userid!==chatList_selected._id){
                                enqueueSnackbar('',{
                                    autoHideDuration:4000,
                                    variant:'info',
                                    anchorOrigin:{
                                        horizontal:'right',
                                        vertical:'top'
                                    },
                                    children:(key)=>(
                                        snackBar(data,key)
                                    )
                                })  
                            }else{
                                data.listData.newMsgNum=0;
                                setNewMsgData(data.data);
                                chatSocket.emit('receive',{'userid':userInfo._id,'friendid':chatList_selected._id});//确认消息
                            }
                        }
                        let updatedListData=updateChatList(chatList_data.slice(),data.listData);//更新chatlist
                        update_chatListData(updatedListData);
            });
            return ()=>{
                chatSocket.off('from')
            }
    },[chatList_data,chatList_selected]);
    function callRemind(){//视频通话提醒
        let width=document.getElementsByClassName('chat')[0].offsetWidth;
        return (
            <Fade>
                        <Paper className="called" style={{width:width+'px'}} elevation={4}>
                            <div className="userInfo">
                                {
                                    newChatData!==null&&
                                    <div>
                                        <img src={imgHost+newChatData.listData.friendid[0].avatar} className="avatar"/>
                                        <div className="name">{newChatData.listData.friendid[0].name}</div>
                                    </div>
                                }
                            </div>
                            <div className="answer">
                                <ButtonBase className='iconBtn' style={{backgroundColor:'#D32F2F'}} 
                                    onClick={()=>{ 
                                        chatSocket.emit('call',{'action':'callend','userid':userInfo._id,'friendid':newChatData.data.userid});
                                        update_VAState('close');
                                        }}>
                                    <CallEnd style={{color:'#fff',width:'30px',height:'30px'}}  />
                                </ButtonBase>
                                <ButtonBase className="iconBtn" style={{backgroundColor:'#4CAF50'}}
                                    onClick={()=>{  
                                        if(snackBarKey) closeSnackbar(snackBarKey);
                                    }}>
                                    <Phone style={{width:'30px',height:'30px',color:'#fff'}}/>
                                </ButtonBase>
                            </div>
                        </Paper>
            </Fade>
        )
    }
    return null;
}