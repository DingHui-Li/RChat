import React, { useEffect } from 'react'
import {Paper,TextField,Button,Tooltip,Fade,Popper,ClickAwayListener,Tab,Tabs} from '@material-ui/core'
import {TagFaces,LocalPhone,Videocam,VolumeUp,FolderOpen, ContactsOutlined} from '@material-ui/icons'
import SwipeableViews from 'react-swipeable-views';

import './css/sendChat.css'
import SendIcon from '@material-ui/icons/Send'
import {chatSocket} from '../../../config'
import {useGlobal} from '../../../context/globalContext'
import {useSnackbar} from 'notistack'
import {updateChatList} from '../../../util/arrayUtil'
import {initMediaStream} from '../../../util/getMediaStream'
import {useApp} from '../../../context/appContext'
import {axiosInstance as Axios} from '../../../index'

export default function SendChat(props){
    const [msgText,setMsgText]=React.useState('');
    const {userInfo}=useGlobal();
    const {enqueueSnackbar}=useSnackbar();
    const {chatList_data,update_chatListData,chatList_selected}=useApp();
    const {setNewMsgData}=useApp();
    const {update_VAState}=useApp();
    const [sendBtnDisabled,setSendBtnDisabled]=React.useState(false);
    const [emojiSelected,setEmojSelected]=React.useState(0);

    useEffect(()=>{
        if(chatList_selected.action==='callVideo'){
            call();
        }
    },[chatList_selected])

    const [emojis,setEmojis]=React.useState(null);
    const [category,setCategory]=React.useState([]);

    useEffect(()=>{
        Axios({
            method:'get',
            dataType:'json',
            url:'emoji.json'
        }).then(res=>{
            setEmojis(res.data);
            let temp=[];
            for(let cate in res.data){
                temp.push(cate);
            }
            setCategory(temp);
        }).catch(err=>{
            enqueueSnackbar('获取emoj文件错误',{variant:'error'});
        })
    },[])
    function msgTextChange(e){
        setMsgText(e.target.value);
    }
    function send(){
        setSendBtnDisabled(true);
        setAnchorEl(null);
        if(!chatSocket.connected){
            enqueueSnackbar('未连接',{variant:'error'});
            setSendBtnDisabled(false);
            return;
        }
        if(msgText.trim()!==""){
            chatSocket.emit('to',
                            {'userid':userInfo._id,'friendid':chatList_selected._id,'msg':msgText,'type':'text'},
                            function(data){
                                setSendBtnDisabled(false);
                                if(data.code===200){
                                    setMsgText('');
                                    data.msgData.code=data.code;
                                    data.msgData.msg=data.msg;
                                    
                                    setNewMsgData(data.msgData);
                                    let updatedListData=updateChatList(chatList_data,data.listData);
                                    update_chatListData(updatedListData);
                                }else{
                                    enqueueSnackbar('发送失败：'+data.msg,{variant:'error'});
                                }
                            }
            );
        }else{
            setSendBtnDisabled(false);
        }
    } 
    function toCallFunction(data){//to回调函数
        if(data.code===200){
            setMsgText('');
            data.msgData.code=data.code;
            data.msgData.msg=data.msg;
            setNewMsgData(data.msgData);
            
            let updatedListData=updateChatList(chatList_data,data.listData);
            update_chatListData(updatedListData);
        }else{
            enqueueSnackbar('发送失败：'+data.msg,{variant:'error'});
        }
    }

    useEffect(()=>{
        chatSocket.on('answer',async function(data){
            if(!window.rpc) return ;
            if(!window.rpc.remoteDescription){
                window.rpc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
            if(data.candidate)  window.rpc.addIceCandidate(data.candidate);
        })
    },[])

    async function call(){
            update_VAState('call');
            let stream=await initMediaStream();
            if(!stream){
                enqueueSnackbar('无可用的视频输入流',{variant:'error'});
                return;
            }
            document.getElementById('selfVideo').srcObject=stream;
            window.rpc.addTrack(stream.getVideoTracks()[0],stream);
            window.rpc.createOffer({OfferToReceiveAudio: true, OfferToReceiveVideo: true}).then(function(offer){//发起端offer
                chatSocket.emit('to',{'userid':userInfo._id,'friendid':chatList_selected._id,'msg':'','type':'video'},toCallFunction);
                window.rpc.setLocalDescription(new RTCSessionDescription(offer));
            }).catch(function(err){
                console.log(err);
            });
            window.rpc.onicecandidate=function(event){
                if(event.candidate&&event.candidate.candidate){
                    chatSocket.emit('sendOffer',{'friendid':chatList_selected._id,'candidate':event.candidate,'sdp':window.rpc.localDescription});
                }
            }
            window.rpc.ontrack=function(event){
                document.getElementById('videoChat').srcObject=event.streams[0];
            };
    }
    const [anchorEl,setAnchorEl]=React.useState(null);  
    const open=Boolean(anchorEl);
    
    function emojiPoper(){
        return(
            <Popper  id="emojPopover" open={open} anchorEl={anchorEl} placement={'top'} transition keepMounted={false}>
                {
                    ({TransitionProps })=>(
                        <Fade {...TransitionProps} timeout={350}>
                            <Paper id="emojContainer" elevation={10}>
                                <Tabs value={emojiSelected} variant='scrollable' onChange={(e,index)=>{setEmojSelected(index)}}>
                                    {
                                        category.map(cate=>{
                                            return(
                                                <Tab label={cate} key={cate}></Tab>
                                            )
                                        })
                                    }
                                </Tabs>
                                {
                                    emojis&&
                                    <SwipeableViews index={emojiSelected} hysteresis={0.1} enableMouseEvents={true} onChangeIndex={(index)=>{setEmojSelected(index)}}>
                                        {
                                            category.map((cate,index)=>{
                                                let emojPanel=emojis[cate].map((emoj,index)=>{
                                                                return (
                                                                    <span key={'emoj'+index} onClick={()=>{
                                                                        let temp=msgText;
                                                                        temp+=emoj.emoji;
                                                                        setMsgText(temp);
                                                                    }}>{emoj.emoji}</span>
                                                                )
                                                            })
                                                return(
                                                    <div key={index} className='emojPanel'>
                                                        {emojPanel}
                                                    </div>
                                                )
                                            })
                                        }
                                    </SwipeableViews>
                                }
                            </Paper>
                        </Fade>
                    )
                }
            </Popper >
        )
    }
    function Toolbar(){
        return (
            <div className='toolbar'>
                <Tooltip title="Emoji">
                    <TagFaces className='icon' aria-describedby={'emojPopover'} 
                        onClick={(e)=>{
                            if(anchorEl===null){
                                setAnchorEl(e.currentTarget);
                            } 
                            else setAnchorEl(null);
                        }} />
                </Tooltip>
                {emojiPoper()}
                <Tooltip title='语音通话'>
                    <LocalPhone  className='icon'/>
                </Tooltip>
                <Tooltip title='视频通话'>
                    <Videocam  className='icon' 
                    onClick={()=>{call()}}/>
                </Tooltip>
                <Tooltip title='语音消息'>
                    <VolumeUp  className='icon'/>
                </Tooltip>
                <Tooltip title='发送文件'>
                    <FolderOpen  className='icon'/>
                </Tooltip>
                <div className="sendButton">
                    <Button variant="outlined" color='primary' disabled={sendBtnDisabled} onClick={()=>{send()}}>
                        <SendIcon />发送
                    </Button>
                </div>
            </div>
        )
    }
    return(
        <Paper className='sendChat' style={{animationDuration:'0.5s'}} elevation={0}>
            {Toolbar()}
            <div type='text' className="textArea" onClick={()=>{setAnchorEl(null)}}>
                <TextField multiline={true} fullWidth={true} autoFocus={true} className="text" onChange={msgTextChange} value={msgText} placeholder="在此输入..."></TextField>
            </div>
        </Paper>
    )
}
