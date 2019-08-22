import React, { useEffect } from 'react'
import {Grid,Avatar, Paper,Button,Hidden} from '@material-ui/core'
import {ArrowBack} from '@material-ui/icons'
import '../css/chat.css'
import{apiHost,imgHost,chatSocket} from '../config'
import SendChat from './sendChat';
import Message from './message'
import {globalContext} from '../index'
import {friendContext} from '../views/App'
import {friendsContext} from '../views/App'
import {axiosInstance as Axios} from '../index'
import {useSnackbar} from 'notistack'
import {getFriendData} from '../util/friendsUtil'

export default function Chat(props){
    const userInfo=React.useContext(globalContext).userInfo;
    const {enqueueSnackbar,closeSnackbar} =useSnackbar();
    const selectFriend=React.useContext(friendContext).selectFriend;
    const updateSelect=React.useContext(friendContext).updateSelect;
    const friends=React.useContext(friendsContext);
    const [msgData,setMsgData]=React.useState([]);
    useEffect(()=>{
        if(selectFriend._id!==undefined){
            getChat();
        }
    },[selectFriend]);
    
    useEffect(()=>{  
                console.log('创建监听');
                chatSocket.off('from');
                chatSocket.on('from',data=>{//chat组件->message组件->oneMsg组件 
                    if(data.data.userid!==selectFriend._id){//
                        let friendData=getFriendData(friends,data.data.userid);
                        enqueueSnackbar('',{
                            autoHideDuration:5000,
                            variant:'info',
                            anchorOrigin:{
                                horizontal:'right',
                                vertical:'top'
                            },
                            children:(key)=>(
                                <Paper style={{padding:'0',minWidth:'300px',cursor:'pointer'}} 
                                        onClick={()=>{
                                                updateSelect(friendData);
                                                closeSnackbar(key);
                                        }}>
                                    <div style={{borderBottom:'1px solid #e0e0e0',padding:'10px'}}>
                                        <Avatar src={imgHost+friendData.avatar} style={{width:'20px',height:'20px',float:'left'}}></Avatar>
                                        <div style={{display:'inline-block',lineHeight:'20px',marginLeft:'5px',fontSize:'0.8rem',color:'#757575'}}>{friendData.name}</div>
                                    </div>
                                    <div style={{padding:'10px',overflow: 'hidden',whiteSpace: 'nowrap',textOverflow: 'ellipsis',marginLeft:'5px'}}>
                                        {data.data.chat.substring(0,35)}
                                    </div>
                                </Paper>
                            )
                        })
                    }
                    if(selectFriend._id===data.data.userid){
                         newMsg(data.data);
                    }
                });
    },[friends,selectFriend,msgData])

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
                _id:0,
                friendid:selectFriend._id,
                page:1,
            }
        }).then(res=>{
            if(res.data.code===200){
                console.log(res.data.data)
                setMsgData(res.data.data)
            }
        })
    }
    function sendMsg(msg){//sendChat组件->chat组件->message组件
        let temp=msgData.slice();
        temp.push(JSON.parse(msg)) 
        setMsgData(temp);
    }
    return (
        <Grid item xs={12} className='chat'>
            {
                selectFriend!==-1&& 
                <div>
                    <Grid item xs={12} className="topBar">
                        <Hidden mdUp>
                            <Button style={{float:'left'}} onClick={()=>{updateSelect(-1)}}>
                                <ArrowBack></ArrowBack>
                            </Button>
                        </Hidden>
                        <div>
                             <div className="userInfo">
                                <Avatar src={imgHost+selectFriend.avatar} className="avatar"></Avatar>
                                <span className="name">{selectFriend.name}</span>
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