import React, { useEffect } from 'react'
import {Grid,Avatar, Paper,Button,Hidden,Fade,ButtonBase,Slide } from '@material-ui/core'
import {ArrowBack,KeyboardArrowRight,CallEnd,Phone,HighlightOff} from '@material-ui/icons'
import './css/chat.css'
import{apiHost,imgHost,chatSocket,iceServers} from '../../../config'
import {axiosInstance as Axios} from '../../../index'
import SendChat from './sendChat';
import Message from './message'
import {globalContext} from '../../../index'
import {useApp} from '../../../context/appContext'
import {updateFriendLineState } from '../../../util/arrayUtil'

export default function Chat(props){
    const {chatList_selected,update_chatListSelected}=useApp();
    const {friendsList_data, update_friendsList,update_friendsListSelected}=useApp();
    const {msgData,setMsgData} = useApp();
    const [isLine,setIsLine] = React.useState(false);

    function messageArea(){
        let windowHeight=window.innerHeight;
        let h=windowHeight-60-250;
        return(
            <Message height={h+'px'}/>
        )
    }

    useEffect(()=>{
        Axios({
            method:'get',
            url:apiHost+'/friend/isLine?id='+chatList_selected._id,
        }).then(res=>{
            setIsLine(res.data.line);

            let newFriendList=updateFriendLineState(friendsList_data,res.data.line,chatList_selected._id);
            update_friendsList(newFriendList);
        })
    },[chatList_selected])
    
    return (
            <div className='chat'>
                <Grid item xs={12} className="topBar">
                    <Hidden mdUp>
                        <Button style={{float:'left'}} onClick={()=>{setMsgData([]);update_chatListSelected(-1)}}>
                            <ArrowBack></ArrowBack>
                        </Button>
                    </Hidden>
                    <div className="userInfo" onClick={()=>{
                        update_friendsListSelected(chatList_selected);
                        update_chatListSelected(-1);
                    }}>
                        <Avatar src={imgHost+chatList_selected.avatar} className="avatar"></Avatar>
                        <div className="name">
                            {chatList_selected.name}
                            <span className="linetip" style={{color:isLine?'#4CAF50':'#FF5252'}}>
                                {
                                    isLine?'[在线]':'[离线]'
                                }
                            </span>
                        </div>
                    </div>
                </Grid>
                {
                    messageArea()
                }
                <SendChat/>
            </div>
    )
}