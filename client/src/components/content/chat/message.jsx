import React, { useEffect } from 'react'
import './css/message.css'
import OneMsg from './oneMsg'
import {globalContext} from '../../../index'
import {scrollDown} from '../../../util/scrollRoll'
import {isVAContext} from '../../../views/App'
import {apiHost} from '../../../config'
import {axiosInstance as Axios} from '../../../index'
import {findIndex} from '../../../util/arrayUtil'
import { VariableSizeList as List } from 'react-window';
// import {useMsgData} from '../../../context/msgContext'
// import {useChatList} from '../../../context/chatListContext'
import {useApp} from '../../../context/appContext'

export default function Message(props){
    const userInfo=React.useContext(globalContext).userInfo;
    const {chatList_data,update_chatListData,chatList_selected,update_chatListSelected}=useApp();
    const {msgData,setMsgData}=useApp();
    useEffect(()=>{
        if(chatList_selected._id!==undefined){
            Axios({
                method:'post',
                url:apiHost+'/chat/getChat',
                data:{
                    friendid:chatList_selected._id,
                    time:new Date()
                }
            }).then(res=>{
                if(res.data.code===200){
                    setMsgData(res.data.data);
                    //setMsgData(res.data.data)
                }
            })
            // console.log(selectFriend)
            let temp=chatList_data.slice();//清除消息列表提醒
            let temp_=temp.map((item)=>item.friendid[0]);
            let index=findIndex(temp_,'_id',chatList_selected._id);
            if(index!==-1){
                temp[index].newMsgNum=0;
                update_chatListData(temp);
            }
        }
    },[chatList_selected]);
    useEffect(()=>{
        scrollDown('messageBox');
    },[msgData]);

    function rowRender({index}){
        let msg=msgData[index];
        return(
            <OneMsg isme={msg.userid===userInfo._id} msgData={msg} key={msg._id}></OneMsg>
        )
    }
    let width=1;
    let height=1;
    if(document.getElementById('messageBox')){
        width=document.getElementById('messageBox').offsetWidth-20;
        height=document.getElementById('messageBox').offsetHeight;
    }

    return(
        <div className="message" id="messageBox" style={{height:props.height}}>
            {
                msgData.filter((item,index)=>index>=msgData.length-20).map((msg)=>{
                    if(msg!=[]){
                        return  <OneMsg isme={msg.userid===userInfo._id} msgData={msg} key={msg._id}></OneMsg>
                    }
                })
            }
            {/* <List height={height} width={width} itemCount={msgData.length} itemSize={()=>30}>
                {rowRender}
            </List> */}
        </div>
    )
}