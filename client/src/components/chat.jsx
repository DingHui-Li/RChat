import React, { useEffect } from 'react'
import {Grid,Avatar, Paper,Button,Hidden,Fade } from '@material-ui/core'
import {ArrowBack,KeyboardArrowRight} from '@material-ui/icons'
import '../css/chat.css'
import{apiHost,imgHost,chatSocket} from '../config'
import SendChat from './sendChat';
import Message from './message'
import {globalContext} from '../index'
import {chatListContext} from '../views/App'
import {axiosInstance as Axios} from '../index'
import {useSnackbar} from 'notistack'
import {timeParse} from '../util/timeUtil'
import {updateChatList,findIndex} from '../util/arrayUtil'

export default function Chat(props){
    const userInfo=React.useContext(globalContext).userInfo;
    const {enqueueSnackbar,closeSnackbar} =useSnackbar();
    const chatList=React.useContext(chatListContext);
    const [msgData,setMsgData]=React.useState([]);
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
    
    useEffect(()=>{  //监听接受的消息
                chatSocket.off('from');console.log('监听')
                chatSocket.on('from',(data)=>{//chat组件->message组件->oneMsg组件 
                    if(data.data.userid!==chatList.selectChat.value._id){//
                        enqueueSnackbar('',{
                            autoHideDuration:8000,
                            variant:'info',
                            anchorOrigin:{
                                horizontal:'right',
                                vertical:'top'
                            },
                            children:(key)=>(
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
                        })
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
    return (
        <Grid item xs={12} className='chat'>
            {
                chatList.selectChat.value!==-1&&
                <div>
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
                     <SendChat sendMsg={sendMsg} />
                </div>
            }
        </Grid>
    )
}