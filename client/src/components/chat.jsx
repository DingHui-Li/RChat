import React, { useEffect } from 'react'
import {Grid,Avatar, Paper,Button,Hidden,Fade,ButtonBase} from '@material-ui/core'
import {ArrowBack,KeyboardArrowRight,CallEnd,Phone,HighlightOff} from '@material-ui/icons'
import '../css/chat.css'
import{apiHost,imgHost,chatSocket,iceServers} from '../config'
import SendChat from './sendChat';
import Message from './message'
import {globalContext} from '../index'
import {chatListContext,isVAContext} from '../views/App'
import {axiosInstance as Axios} from '../index'
import {useSnackbar, withSnackbar} from 'notistack'
import {timeParse} from '../util/timeUtil'
import {updateChatList,findIndex} from '../util/arrayUtil'

export default function Chat(props){
    const userInfo=React.useContext(globalContext).userInfo;
    const {enqueueSnackbar,closeSnackbar} =useSnackbar();
    const chatList=React.useContext(chatListContext);
    const [msgData,setMsgData]=React.useState([]);
    const isVA=React.useContext(isVAContext);

    useEffect(()=>{//获取选中的消息数据
        if(chatList.selectChat.value._id!==undefined){
            getChat();
            // console.log(selectFriend)
            let temp=chatList.listData.data.slice();//清除消息列表提醒
            let temp_=temp.map((item)=>item.friendid[0]);
            let index=findIndex(temp_,'_id',chatList.selectChat.value._id);
            if(index!==-1){
                temp[index].newMsgNum=0;
                chatList.listData.updateListData(temp);
            }
        }
    },[chatList.selectChat.value]);
    
    function snackBar(data,key){
        return (
            <Paper style={{padding:'0',minWidth:'300px',cursor:'pointer'}}  elevation={5}
                                            onClick={()=>{
                                                chatList.selectChat.updateChatSelect(data.listData.friendid[0]);
                                                closeSnackbar(key);
                                            }}>
                <div style={{borderBottom:'1px solid #e0e0e0',padding:'10px'}}>
                    <Avatar src={imgHost+data.listData.friendid[0].avatar} style={{width:'23px',height:'23px',float:'left'}}></Avatar>
                    <div style={{display:'inline-block',lineHeight:'23px',marginLeft:'5px',fontWeight:'bold'}}>
                        <div> {data.listData.friendid[0].name}</div>
                    </div>
                    <div style={{fontWeight:'normal',fontSize:'10px',float:'right'}}>{timeParse(data.data.time)}</div>
                </div>
                <div style={{padding:'10px',overflow: 'hidden',whiteSpace: 'nowrap',textOverflow: 'ellipsis',marginLeft:'28px'}}>
                    {data.data.chat.substring(0,35)}
                    <div style={{float:'right'}}> <KeyboardArrowRight /></div> 
                </div>
            </Paper>
        )
    }
    function snackBar2VA(data,key,connection){
        return(
            <Paper style={{padding:'0',minWidth:'300px',cursor:'pointer'}}  elevation={5}>
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
                            isVA.updateIsVA('callend');
                            }}>
                        <CallEnd style={{width:'30px',height:'30px',color:'#fff'}}/>
                    </ButtonBase>
                    <ButtonBase style={{backgroundColor:'#4CAF50',borderRadius:'50%',width:'40px',height:'40px',marginLeft:'20px'}} 
                        onClick={()=>{
                            chatList.selectChat.updateChatSelect(data.listData.friendid[0]);
                            closeSnackbar(key);
                            if(window.rpc){
                                window.rpc.createAnswer().then(function(answer){
                                    window.rpc.setLocalDescription(answer);//接收端 answer（snackbar）
                                    chatSocket.emit('call',{'action':'called','userid':userInfo._id,'friendid':data.data.userid,'answer':answer});
                                });
                                window.rpc.onicecandidate=function(event){
                                    if(event.candidate){
                                        chatSocket.emit('iceCandidate',{'userid':userInfo._id,'friendid':data.data.userid,'iceCandidate':event.candidate});
                                    }
                                }
                            }
                            isVA.updateIsVA('called')
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
    const [newMsgData,setNewMsgData]=React.useState(null);
    const [snackBarKey,setSnackBarKey]=React.useState(null);
    useEffect(()=>{  //监听接受的消息
                chatSocket.off('from');console.log('监听')
                chatSocket.on('from',function(data){//chat组件->message组件->oneMsg组件 
                    setNewMsgData(data);
                    isVA.updateIsVA('false');
                    //
                        if(data.data.type==='video'){
                            window.rpc=new RTCPeerConnection(iceServers);
                            window.rpc.setRemoteDescription(data.offer);//接收端offer
                            window.rpc.ontrack=function(event){
                                console.log(event);
                            }
                            if(data.data.userid!==chatList.selectChat.value._id){
                                const key=enqueueSnackbar('',{
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
                            }
                        }else{
                            if(data.data.userid!==chatList.selectChat.value._id){
                                enqueueSnackbar('',{
                                    autoHideDuration:8000,
                                    variant:'info',
                                    anchorOrigin:{
                                        horizontal:'right',
                                        vertical:'top'
                                    },
                                    children:(key)=>(
                                        snackBar(data,key)
                                    )
                                })
                            }
                        }
                    if( chatList.selectChat.value._id===data.data.userid){
                        data.listData.newMsgNum=0;
                        newMsg(data.data);
                        chatSocket.emit('receive',{'userid':userInfo._id,'friendid':chatList.selectChat.value._id});//确认消息
                    }
                    let updatedListData=updateChatList(chatList.listData.data,data.listData);//更新chatlist
                    chatList.listData.updateListData(updatedListData);
                });
    },[chatList.listData,chatList.selectChat.value,msgData])

    useEffect(()=>{
        chatSocket.on('call',function(data){
            console.log(data)
            if(data.action==='called'){
                if(window.rpc){
                    window.rpc.setRemoteDescription(data.answer);//发起端answer
                }
            }else{  
                closeSnackbar(snackBarKey);
            }
            isVA.updateIsVA(data.action)
        });
        chatSocket.on('iceCandidate',function(data){
            if(window.rpc){
                    window.rpc.addIceCandidate(new RTCIceCandidate(data.iceCandidate))
                    .then(function(){
                        console.log('addIceCandidate success');
                    })
                    .catch(function(err){
                        console.log(err);
                    });
            }
        })
    },[])
    function newMsg(msg){
        let temp=msgData.slice();
        temp.push(msg)
        setMsgData(temp);
    }
    function messageArea(){
        let windowHeight=window.innerHeight;
        let h=windowHeight-60-250;
        return(
            <Message height={h+'px'} newMsgData={msgData}/>
        )
    }
    function getChat(){
        Axios({
            method:'post',
            url:apiHost+'/chat/getChat',
            data:{
                friendid:chatList.selectChat.value._id,
                time:new Date()
            }
        }).then(res=>{
            if(res.data.code===200){
                setMsgData(res.data.data)
            }
        })
    }
    function sendMsg(msg){//sendChat组件->chat组件->message组件->oneMsg组件
        let temp=msgData.slice();
        temp.push(JSON.parse(msg)) 
        setMsgData(temp);
    }
    function called(){
        if(snackBarKey) closeSnackbar(snackBarKey);
        if(window.rpc){
            window.rpc.createAnswer({offerToReceiveAudio: 0,offerToReceiveVideo: 1}).then(function(answer){
                window.rpc.setLocalDescription(answer);//接收端answer（chat界面）
                chatSocket.emit('call',{'action':'called','userid':userInfo._id,'friendid':newMsgData.data.userid,'answer':answer});
            });
            window.rpc.onicecandidate=function(event){
                if(event.candidate){
                    chatSocket.emit('iceCandidate',{'userid':userInfo._id,'friendid':newMsgData.data.userid,'iceCandidate':event.candidate});
                }
            }
        }
        isVA.updateIsVA('called')
    }
    function callRemind(){//视频通话提醒
        let width=document.getElementsByClassName('chat')[0].offsetWidth;
        return (
            <Fade in={newMsgData!==null&&newMsgData.data.type==='video'&&isVA.value==='false'&&chatList.selectChat.value._id===newMsgData.data.userid}>
                <Paper className="called" style={{width:width+'px'}} elevation={4}>
                    <div className="userInfo">
                        {
                            newMsgData!==null&&
                            <div>
                                <img src={imgHost+newMsgData.listData.friendid[0].avatar} className="avatar"/>
                                <div className="name">{newMsgData.listData.friendid[0].name}</div>
                            </div>
                        }
                    </div>
                    <div className="answer">
                        <ButtonBase className='iconBtn' style={{backgroundColor:'#D32F2F'}} 
                            onClick={()=>{ 
                                chatSocket.emit('call',{'action':'callend','userid':userInfo._id,'friendid':newMsgData.data.userid});
                                isVA.updateIsVA('close');
                                if(snackBarKey) closeSnackbar(snackBarKey);
                                }}>
                            <CallEnd style={{color:'#fff',width:'30px',height:'30px'}}  />
                        </ButtonBase>
                        <ButtonBase className="iconBtn" style={{backgroundColor:'#4CAF50'}}
                            onClick={()=>{called()}}>
                            <Phone style={{width:'30px',height:'30px',color:'#fff'}}/>
                        </ButtonBase>
                    </div>
                </Paper>
            </Fade>
        )
    }
    return (
        <Grid item xs={12} className='chat'>
            {
                chatList.selectChat.value!==-1&&
                <div>
                    {
                        callRemind()
                    }
                    <Grid item xs={12} className="topBar">
                        <Hidden mdUp>
                            <Button style={{float:'left'}} onClick={()=>{chatList.selectChat.updateChatSelect(-1)}}>
                                <ArrowBack></ArrowBack>
                            </Button>
                        </Hidden>
                        <div>
                            <div className="userInfo">
                                <Avatar src={imgHost+chatList.selectChat.value.avatar} className="avatar"></Avatar>
                                <span className="name">{chatList.selectChat.value.name}</span>
                            </div>
                        </div>
                    </Grid>
                    {
                        messageArea()
                    }
                    <SendChat sendMsg={sendMsg}/>
                </div>
            }
        </Grid>
    )
}