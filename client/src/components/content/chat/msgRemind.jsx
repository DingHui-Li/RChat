import React,{ useEffect } from 'react'
import {Avatar,Fade,ButtonBase,Paper,IconButton} from '@material-ui/core'
import {CallEnd,Phone,HighlightOff,ExpandMore,Check,Close,ExpandLess} from '@material-ui/icons'
import{imgHost,chatSocket,iceServers, apiHost} from '../../../config'
import {useSnackbar} from 'notistack'
import {timeParse} from '../../../util/timeUtil'
import {updateChatList} from '../../../util/arrayUtil'
import {initMediaStream} from '../../../util/getMediaStream'
import {useApp} from '../../../context/appContext'
import {useGlobal} from '../../../context/globalContext'


export default function MsgRemind(){
    const {userInfo}=useGlobal();    
    const {enqueueSnackbar,closeSnackbar} =useSnackbar();
    const {chatList_data,update_chatListData,chatList_selected,update_chatListSelected}=useApp();
    const {friendsList_data, update_friendsList}=useApp();
    const {update_VAState}=useApp();
    const {setNewMsgData}=useApp();
    const {applyList,updateApplyList}=useApp();

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
            if(!window.rpc.remoteDescription) await window.rpc.setRemoteDescription(new RTCSessionDescription(data.sdp)).catch(err=>{
                console.log(err);
            });
            window.rpc.addIceCandidate(data.candidate).then(()=>{
                console.log(data.candidate);
            }).catch(err=>{

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
                    <div style={{fontWeight:'normal',fontSize:'10px',float:'right'}}>新消息</div>
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
                            closeSnackbar(key);
                            update_VAState('called');
                            let stream=await initMediaStream();
                            if(!stream){
                                enqueueSnackbar('无可用的视频输入流',{variant:'error'});
                                return;
                            }
                            document.getElementById('selfVideo').srcObject=stream;
                            window.rpc.addTrack(stream.getVideoTracks()[0],stream);
                            chatSocket.emit('call',{'action':'called','userid':userInfo._id,'friendid':data.data.userid});
                            //if(!window.rpc.remoteDescription) window.rpc.setRemoteDescription(new RTCSessionDescription(data.offer));
                            await window.rpc.createAnswer().then(function(answer){
                                //chatSocket.emit('sendAnswer',{'friendid':data.data.userid,'candidate':'','sdp':answer});
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
                        if(data.friend){
                            let temp=friendsList_data.slice();
                            temp.push(data.friend);
                            update_friendsList(temp);
                        }
                        if(data.data.type==='video'){ 
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

    useEffect(()=>{
        chatSocket.on('newApply',function(data){
            let temp=applyList.slice();
            data.data.user=data.user;
            temp.push(data.data);
            if(temp.length>3) temp.shift();
            updateApplyList(temp);
            enqueueSnackbar('',{
                children:(key)=>(
                <Paper elevation={15} style={{padding:'10px',transition:'height .3s ease-out'}} id="applyNotice">
                    <Avatar src={imgHost+data.user.avatar} style={{width:'40px',height:'40px',float:'left',marginRight:'10px'}}></Avatar>
                    <div style={{whiteSpace:'nowrap',overflow:'hidden',float:'left'}}>
                        <div style={{whiteSpace:'nowrap',textOverflow:'ellipsis',fontWeight:'bold',width:'300px'}}>
                                {data.user.name}
                                <span style={{float:'right',fontWeight:'bold',fontSize:'0.8rem',color:"#757575"}}>新的好友请求</span>
                        </div>
                        <div style={{whiteSpace:'nowrap',textOverflow:'ellipsis',fontSize:'0.8rem',color:'#757575',maxWidth:'100px'}}>{data.data.msg}</div>
                    </div>
                    {/* <div style={{overflowZ:'hidden',float:'right',marginLeft:'20px',display:'flex',alignItems:'center'}}>
                        <IconButton style={{backgroundColor:'#4CAF50',width:'40px',height:'40px'}} onClick={()=>{
                            Axios({
                                method:'post',
                                url:apiHost+'/friend/applyAction',
                                data:{id:data.user._id,action:'agree'}
                            }).then(res=>{
                                if(res.data.code===200){
                                    enqueueSnackbar('添加成功',{variant:'success'});
                                    chatSocket.emit('to',{'userid':userInfo._id,'friendid':data.user._id,'msg':'我已经同意了你的好友请求','type':'text'},function(data){
                                        if(data.code===200){
                                            data.msgData.code=data.code;
                                            data.msgData.msg=data.msg;
                                            let updatedListData=updateChatList(chatList_data,data.listData);
                                            update_chatListData(updatedListData);
                                        }else{
                                            enqueueSnackbar('发送失败：'+data.msg,{variant:'error'});
                                        }
                                    })
                                }else{
                                    enqueueSnackbar(data.msg,{variant:'error'});
                                }
                            })
                        }}>
                            <Check style={{color:'#fff'}} />
                        </IconButton>
                        <IconButton  style={{backgroundColor:'#D32F2F',marginLeft:'30px',width:'40px',height:'40px'}}>
                            <Close style={{color:'#fff'}}/>
                        </IconButton>
                        <IconButton style={{float:'right',width:'20px',height:'20px',marginLeft:'20px'}} 
                                            onClick={()=>{closeSnackbar(key)}}>
                            <HighlightOff />
                        </IconButton>
                    </div> */}
                </Paper>
            )})
        })
    },[applyList])
    // function callRemind(){//视频通话提醒
    //     let width=document.getElementsByClassName('chat')[0].offsetWidth;
    //     return (
    //         <Fade>
    //                     <Paper className="called" style={{width:width+'px'}} elevation={4}>
    //                         <div className="userInfo">
    //                             {
    //                                 newChatData!==null&&
    //                                 <div>
    //                                     <img src={imgHost+newChatData.listData.friendid[0].avatar} className="avatar"/>
    //                                     <div className="name">{newChatData.listData.friendid[0].name}</div>
    //                                 </div>
    //                             }
    //                         </div>
    //                         <div className="answer">
    //                             <ButtonBase className='iconBtn' style={{backgroundColor:'#D32F2F'}} 
    //                                 onClick={()=>{ 
    //                                     chatSocket.emit('call',{'action':'callend','userid':userInfo._id,'friendid':newChatData.data.userid});
    //                                     update_VAState('close');
    //                                     }}>
    //                                 <CallEnd style={{color:'#fff',width:'30px',height:'30px'}}  />
    //                             </ButtonBase>
    //                             <ButtonBase className="iconBtn" style={{backgroundColor:'#4CAF50'}}
    //                                 onClick={()=>{  
    //                                     if(snackBarKey) closeSnackbar(snackBarKey);
    //                                 }}>
    //                                 <Phone style={{width:'30px',height:'30px',color:'#fff'}}/>
    //                             </ButtonBase>
    //                         </div>
    //                     </Paper>
    //         </Fade>
    //     )
    // }
    return null;
}