import React, { useEffect } from 'react'
import {Paper,TextField,Button} from '@material-ui/core'
import '../css/sendChat.css'
import SendIcon from '@material-ui/icons/Send'
import {chatSocket} from '../config'
import {globalContext} from '../index'
import {friendContext} from '../views/App'
import {useSnackbar} from 'notistack'

export default function SendChat(props){
    const [msgText,setMsgText]=React.useState('');
    let globalData=React.useContext(globalContext);
    const userInfo=globalData.userInfo;
    const selectFriend=React.useContext(friendContext).selectFriend;
    const {enqueueSnackbar}=useSnackbar();

    useEffect(()=>{
    },[selectFriend])

    function msgTextChange(e){
        setMsgText(e.target.value);
    }
    function send(){
        if(msgText.trim()!==""){
            chatSocket.emit('to',
                            {'userid':userInfo.id,'friendid':selectFriend._id,'msg':msgText},
                            function(message){
                                if(message.code===200){
                                    setMsgText('');
                                    let data=message.data;
                                    props.sendMsg(JSON.stringify(data));
                                }else{
                                    enqueueSnackbar('发送失败：'+message.msg,{variant:'error'});
                                }
                            }
            );
            
            
        }
    }
    return(
        <Paper className='sendChat'>
            <div className='toolbar'>
                1
            </div>
            <div type='text' className="textArea">
                <TextField multiline={true} fullWidth={true} autoFocus={true} className="text" onChange={msgTextChange} value={msgText}></TextField>
            </div>
            <div className="sendButton">
                <Button variant="contained" color='primary' onClick={send}>
                    <SendIcon />发送
                </Button>
            </div>
        </Paper>
    )
}