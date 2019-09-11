import React, { useContext, useEffect } from 'react'
import { globalContext } from '../index';
import {chatListContext} from '../views/App'
import {Avatar,Zoom} from '@material-ui/core'
import {Error} from '@material-ui/icons'
import "../css/oneMsg.css"
import 'animate.css'
import {imgHost} from '../config'
import {timeParse} from '../util/timeUtil'

export default function OneMsg(props){
    const userInfo=React.useContext(globalContext).userInfo;
    const selectChat=React.useContext(chatListContext).selectChat.value;

    return (
            <div className={'oneMsg animated fadeIn'}>
                <div className="time" >
                    <span className='timeTxt'>{timeParse(props.msgData.time,true)}</span> 
                </div>
                {
                    props.isme===true?
                    <div className='msgbox '>
                        <Avatar src={imgHost+userInfo.avatar} className="avatar " style={{float:'right'}}></Avatar>
                        <div className="msgTextRight">
                            <div className="msg rightMsg">
                                {props.msgData.type==='video'?'[视频通话]':props.msgData.chat}
                            </div>
                        </div>
                        {props.msgData.code===500&&<Error className="errorIcon" style={{float:'right'}}></Error>}
                    </div>
                    :
                    <div className="msgbox">
                        <Avatar src={imgHost+selectChat.avatar} className="avatar" style={{float:'left'}}></Avatar>
                        <div className="msgTextLeft">
                            <div className="msg leftMsg">
                                {props.msgData.type==='video'?'[视频通话]':props.msgData.chat}
                            </div>
                        </div>
                        { props.msgData.code===500&&<Error className="errorIcon" style={{float:'left'}}></Error>}
                    </div>
                }
            </div>
    )
}