import React, { useEffect } from 'react'
import {Paper,TextField,Button,Tooltip,Fade,Popper,ClickAwayListener } from '@material-ui/core'
import {TagFaces,LocalPhone,Videocam,VolumeUp,FolderOpen} from '@material-ui/icons'
import '../css/sendChat.css'
import SendIcon from '@material-ui/icons/Send'
import {chatSocket} from '../config'
import {globalContext} from '../index'
import {friendContext,chatListContext} from '../views/App'
import {useSnackbar} from 'notistack'
import {updateChatList} from '../util/arrayUtil'

export default function SendChat(props){
    const [msgText,setMsgText]=React.useState('');
    let globalData=React.useContext(globalContext);
    const userInfo=globalData.userInfo;
    const selectFriend=React.useContext(friendContext).selectFriend;
    const {enqueueSnackbar}=useSnackbar();
    const chatList=React.useContext(chatListContext);

    function msgTextChange(e){
        setMsgText(e.target.value);
    }
    function send(){
        if(!chatSocket.connected){
            enqueueSnackbar('未连接',{variant:'error'});
            return;
        }
        if(msgText.trim()!==""){
            chatSocket.emit('to',
                            {'userid':userInfo._id,'friendid':chatList.selectChat.value._id,'msg':msgText},
                            function(data){
                                if(data.code===200){
                                    setMsgText('');
                                    data.msgData.code=data.code;
                                    data.msgData.msg=data.msg;
                                    props.sendMsg(JSON.stringify(data.msgData));
                                    
                                    let updatedListData=updateChatList(chatList.listData.data,data.listData);
                                    chatList.listData.updateListData(updatedListData);
                                }else{
                                    enqueueSnackbar('发送失败：'+data.msg,{variant:'error'});
                                }
                            }
            );
            
            
        }
    }
    return(
        <Paper className='sendChat animated fadeInUp' style={{animationDuration:'0.5s'}} elevation={0}>
            <Toolbar />
            <div type='text' className="textArea">
                <TextField multiline={true} fullWidth={true} autoFocus={true} className="text" onChange={msgTextChange} value={msgText}></TextField>
            </div>
            <div className="sendButton">
                <Button variant="outlined" color='primary' onClick={send}>
                    <SendIcon />发送
                </Button>
            </div>
        </Paper>
    )
}

function Toolbar(){
    const [anchorEl,setAnchorEl]=React.useState(null);
    const open=Boolean(anchorEl);
    return (
        <div className='toolbar'>
            <Tooltip title="表情">
                <React.Fragment>
                    <ClickAwayListener onClickAway={()=>{setAnchorEl(null)}}>
                        <TagFaces className='icon' aria-describedby={'emojPopover'} 
                            onClick={(e)=>{
                                   if(anchorEl===null) setAnchorEl(e.currentTarget);
                                   else setAnchorEl(null);
                            }} />
                    </ClickAwayListener>
                    <Popper  id="emojPopover" open={open} anchorEl={anchorEl} placement={'top'} transition>
                        {
                            ({TransitionProps })=>(
                                <Fade {...TransitionProps} timeout={350}>
                                    <Paper id="emojContainer">
                                        sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
                                    </Paper>
                                </Fade>
                            )
                        }
                    </Popper >
                 </React.Fragment>
            </Tooltip>
            <Tooltip title='语音通话'>
                <LocalPhone  className='icon'/>
            </Tooltip>
            <Tooltip title='视频通话'>
                <Videocam  className='icon'/>
            </Tooltip>
            <Tooltip title='语音消息'>
                <VolumeUp  className='icon'/>
            </Tooltip>
            <Tooltip title='发送文件'>
                <FolderOpen  className='icon'/>
            </Tooltip>
        </div>
    )
}