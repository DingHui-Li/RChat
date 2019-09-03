import React, { useEffect } from 'react'
import {Grid,Avatar,Typography, Paper,Badge,Button} from '@material-ui/core'
import '../css/chatList.css'
import {axiosInstance as Axios} from '../index'
import {apiHost,imgHost} from '../config'
import {timeParse} from '../util/timeUtil'
import {friendContext,chatListContext} from '../views/App'
import {findIndex} from '../util/arrayUtil'

export default function ChatList(props){
    const selectFriend=React.useContext(friendContext);
    const chatList=React.useContext(chatListContext);
    const [mouseX,setMouseX]=React.useState(-1);
    const [mouseDownX,setMouseDownX]=React.useState(-1);
    useEffect(()=>{
        Axios({
            method:'get',
            url:apiHost+'/chat/getChatList'
        }).then(res=>{
            if(res.data.code===200){
                console.log(res.data.msg)
                chatList.listData.updateListData(res.data.data);
            }
        })
    },[])
   
    function mouseMove(e,id){
        e.preventDefault();
        if(e.buttons===1){
            let elem=document.getElementById(id);
            let currentX=e.clientX;
            let distance=mouseX-currentX;//鼠标移动的距离
            let marginLeft=parseInt(elem.style.marginLeft);
            if(distance>0){//左移动
                if(marginLeft<-50){
                    elem.style.transition="margin-left .3s ease-out";
                    elem.style.marginLeft=-80+'px';
                }
                else{
                    elem.style.transition="margin-left 0s ";
                    elem.style.marginLeft=marginLeft-distance+'px';
                }
            }else{//右移动
                distance=Math.abs(distance);
                if(marginLeft>-80){
                    elem.style.transition="margin-left .3s ease-out";
                    elem.style.marginLeft=0+'px';
                }
                else if(marginLeft+distance<0){
                    elem.style.transition="margin-left 0s ";
                    elem.style.marginLeft=marginLeft+distance+'px';
                }
            }
            setMouseX(currentX);
        }
    }
    function mouseUp(e,id,item,index){
            let elem=document.getElementById(id);
            let marginLeft=parseInt(elem.style.marginLeft);
            if(marginLeft!==-80){
                elem.style.transition="margin-left .3s ease-out";
                elem.style.marginLeft=0+'px';
            }

            if(e.clientX===mouseDownX){//若鼠标按下与松开位置相同==单击事件
                selectFriend.updateSelect(item.friendid[0]);
                // let temp=chatList.listData.data.slice();
                // let index=findIndex(temp,'_id',id);
                // if(index!==-1){
                //     temp[index].newMsgNum=0;
                //     chatList.listData.updateListData(temp);
                // }
                chatList.selectChat.updateChatSelect(item.friendid[0]);
            }
    }
    function remove(id){
        Axios({
            method:'get',
            url:apiHost+'/chat/removeChatList?id='+id
        }).then(res=>{
            if(res.data.code===200){
                let temp=chatList.listData.data.slice();
                let index=findIndex(temp,'_id',id);
                if(index!==-1){
                    temp.splice(index,1);
                    chatList.listData.updateListData(temp);
                }
            }
        })
    }

    return (
        <Grid container id="chatList">
            {
                chatList.listData.data.map((item)=>
                    <Grid item xs={12} key={item._id} >
                         <div className='deleteBox'>
                            <Button className="deleteBtn" onClick={()=>{remove(item._id)}}>删除</Button>
                        </div>
                        <div className="chatItemBox" id={item._id} style={{marginLeft:'0'}}
                            onMouseMove ={(event)=>{mouseMove(event,item._id)}} onMouseDown={(e)=>{setMouseX(e.clientX);setMouseDownX(e.clientX)}} onMouseUp={(e)=>{mouseUp(e,item._id,item)}}>
                            <div className={`chatItem ${item.friendid[0]._id===chatList.selectChat.value._id?'chatSelcted':''}`} >                
                                    <Badge badgeContent={item.newMsgNum} color="secondary" max={99} style={{float:'left'}}>
                                        <Avatar className="avatar" src={imgHost+item.friendid[0].avatar}></Avatar>
                                    </Badge>
                                    <div className={'rightItem'}>
                                        <Typography noWrap={true} className={'name'}>{item.friendid[0].name}</Typography>
                                        <Typography noWrap={true} className={'time'}>{timeParse(item.time)}</Typography>
                                        <Typography noWrap={true} className={'lately'}>{item.latelyChat}</Typography>
                                    </div>
                            </div>
                        </div>
                    </Grid>
                )
            }
        </Grid>
    );
}