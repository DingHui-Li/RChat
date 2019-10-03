import React, { useEffect } from 'react'
import {Paper,Avatar,IconButton,Tooltip,Slide} from '@material-ui/core'
import {Check,Close} from '@material-ui/icons'
import {imgHost,apiHost,chatSocket} from '../../../config'
import '../css/apply.css'
import {axiosInstance as Axios} from '../../../index'
import {useApp} from '../../../context/appContext'
import {findIndex} from '../../../util/arrayUtil'
import {useGlobal} from '../../../context/globalContext'
import {updateChatList} from '../../../util/arrayUtil'

export default function Apply(props){
    const {userInfo} =useGlobal();
    const{update_chatListData,chatList_data}=useApp();
    const{applyList,updateApplyList}=useApp();
    function handleAction(action){ 
        Axios({
            method:'post',
            url:apiHost+'/friend/applyAction',
            data:{
                id:props.data._id,
                action:action,
                userid:props.data.user._id}
        }).then(res=>{
            if(res.data.code===200){
                if(action==='agree'){
                    chatSocket.emit('to',{'userid':userInfo._id,'friendid':props.data.user._id,'msg':'我们已经是好友了，快来聊天吧','type':'text'},
                                                            function(data){
                                                                if(data.code===200){
                                                                    data.msgData.code=data.code;
                                                                    data.msgData.msg=data.msg;
                                                                    
                                                                    let updatedListData=updateChatList(chatList_data,data.listData);
                                                                    update_chatListData(updatedListData);
                                                                }
                                                            }
                    );
                }

                let index=findIndex(applyList,'_id',props.data._id);
                if(index!==-1){
                    let temp=applyList.slice();
                    temp.splice(index,1);
                    updateApplyList(temp);
                }
            }
        })
    }
    return (
        // <Slide in={props.data.status==='new'} direction='right' >
        <div id="apply" className="animated">
            <Paper className="paper" elevation={1}>
                <Avatar src={imgHost+props.data.user.avatar} className="avatar"></Avatar>
                <div className="info">
                    <div className="name">{props.data.user.name}</div>
                    <div className="applyText">{props.data.msg}</div>
                </div>
                <div className="action">
                    <Tooltip placement="top" title="同意" >
                        <IconButton className="btn" style={{backgroundColor:'#4CAF50'}} onClick={()=>handleAction('agree')}>
                            <Check className="icon" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip placement="top" title="拒绝" >
                        <IconButton className="btn" style={{backgroundColor:'#D32F2F',marginLeft:'30px'}} onClick={()=>handleAction('reject')}>
                            <Close className="icon" />
                        </IconButton>
                    </Tooltip>
                </div>
                <Tooltip title="忽略" placement="top" >
                    <IconButton className="clearBtn" onClick={()=>handleAction('ignore')}>
                            <Close className="icon"/>
                    </IconButton>
                </Tooltip >
            </Paper>
        </div>
        // </Slide>
    )
}