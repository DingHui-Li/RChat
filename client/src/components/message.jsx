import React, { useEffect } from 'react'
import '../css/message.css'
import OneMsg from './oneMsg'
import {globalContext} from '../index'
import {scrollDown} from '../util/scrollRoll'

export default function Message(props){
    const userInfo=React.useContext(globalContext).userInfo;
    const [msgs,setMsgs]=React.useState([]);
    useEffect(()=>{
        scrollDown('messageBox');
    },[props.newMsgData])
    return(
        <div className="message" id="messageBox" style={{height:props.height}}>
            {
                props.newMsgData.map(msg=>{
                    if(msg!=[]){
                        return <OneMsg isme={msg.userid===userInfo.id} msgData={msg} key={msg._id}></OneMsg>
                    }
                })
            }
        </div>
    )
}