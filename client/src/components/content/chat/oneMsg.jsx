import React  from 'react'
import {Avatar,Fade} from '@material-ui/core'
import {Error} from '@material-ui/icons'
import "./css/oneMsg.css"
import 'animate.css'
import {imgHost} from '../../../config'
import {timeParse} from '../../../util/timeUtil'
import {useGlobal} from '../../../context/globalContext'
import {useApp} from '../../../context/appContext'

export default function OneMsg(props){
    const {userInfo}=useGlobal();
    const {chatList_selected,update_chatListSelected,update_friendsListSelected}=useApp();

    return (
        <Fade in={true} timeout={700}>
            <div className='oneMsg'>
                <div className="time" >
                    <span className='timeTxt'>{timeParse(props.msgData.time,true)}</span> 
                </div>
                {
                    props.isme===true?
                    <div className='msgbox'>
                        <Avatar src={imgHost+userInfo.avatar} className="avatar" style={{float:'right'}}
                                onClick={()=>{
                                    update_friendsListSelected(userInfo);
                                }}>
                        </Avatar>
                        <div className="msgTextRight">
                            <div className="msg rightMsg">
                                {props.msgData.type==='video'?'[视频通话]':props.msgData.chat}
                            </div>
                        </div>
                        {props.msgData.code===500&&<Error className="errorIcon" style={{float:'right'}}></Error>}
                    </div>
                    :
                    <div className="msgbox">
                        <Avatar src={imgHost+chatList_selected.avatar} className="avatar" style={{float:'left'}}
                                onClick={()=>{
                                    update_friendsListSelected(chatList_selected);
                                }}>
                        </Avatar>
                        <div className="msgTextLeft">
                            <div className="msg leftMsg">
                                {props.msgData.type==='video'?'[视频通话]':props.msgData.chat}
                            </div>
                        </div>
                        { props.msgData.code===500&&<Error className="errorIcon" style={{float:'left'}}></Error>}
                    </div>
                }
            </div>
            </Fade>
    )
}