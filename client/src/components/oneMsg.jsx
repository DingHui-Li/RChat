import React, { useContext, useEffect } from 'react'
import { globalContext } from '../index';
import {friendContext} from '../views/App'
import {Avatar,Grow} from '@material-ui/core'
import "../css/oneMsg.css"
import {imgHost} from '../config'

export default function OneMsg(props){
    const userInfo=React.useContext(globalContext).userInfo;
    const selectFriend=React.useContext(friendContext).selectFriend;

    useEffect(()=>{
        console.log(new Date(props.msgData.time).getTime())
    })
    return (
        <Grow in={true}>
        <div className="oneMsg">
            {
                props.isme===true?
                <div className='msgbox'>
                    <Avatar src={imgHost+userInfo.avatar} className="avatar" style={{float:'right'}}></Avatar>
                    <div className="msgTextRight">
                         <div className="msg rightMsg">
                           {props.msgData.chat}
                        </div>
                    </div>
                   
                </div>
                :
                <div className="msgbox">
                    <Avatar src={imgHost+selectFriend.avatar} className="avatar" style={{float:'left'}}></Avatar>
                    <div className="msgTextLeft">
                         <div className="msg leftMsg">
                            {props.msgData.chat}
                        </div>
                    </div>
                </div>
            }
        </div>
        </Grow>
    )
}