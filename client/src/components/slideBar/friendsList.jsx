import React, { useEffect } from 'react'
import {Grid,Avatar,Typography,Badge} from '@material-ui/core'
import {Mail} from '@material-ui/icons'
import './css/chatList.css'
import './css/friendList.css'
import {apiHost,imgHost} from '../../config'
import {axiosInstance as Axios} from '../../index'
import {useSnackbar} from 'notistack'
import SwipeableViews from 'react-swipeable-views'
import {useApp} from '../../context/appContext'

export default function Friends(props){
    const {enqueueSnackbar}=useSnackbar();
    const {update_chatListSelected} =useApp(); 
    const {friendsList_data,update_friendsList,friendsList_selected,update_friendsListSelected}=useApp();
    useEffect(()=>{
        Axios({
            method:'get',
            url:apiHost+'/friend/getFriendList',
        }).then(res=>{
            if(res.data.code===200){
                update_friendsList(res.data.data);
            }
            else{
                enqueueSnackbar(res.data.msg,{variant:'error'});
            }
        }).catch(err=>{
            enqueueSnackbar('服务器错误',{variant:'error'});
        })
    },[])
        
    return (
        <SwipeableViews axis="y" enableMouseEvents={true} resistance={true} style={{height:'100vh'}}>
            <Grid container id='friendList' >
                {
                    friendsList_data.map((item)=>
                    <Grid item xs={12} key={item._id}  className={`chatItem ${item._id===friendsList_selected._id?'chatSelcted':''}`}  
                        style={{filter:item.line?'':'grayscale(100%)'}}
                        onClick={()=>{
                            update_friendsListSelected(item);
                        }}>
                        <div style={{float:'left'}}>
                            <Avatar className='avatar' src={imgHost+item.avatar}></Avatar>
                        </div>
                        <div className={'rightItem'} >
                            <Typography noWrap={true} className={'name'}>{item.name}</Typography>
                            <div className='descText'>
                                {item.line?'':'[离线]'}
                                {item.descText}
                            </div>
                        </div>
                    </Grid>
                    )
                }
            </Grid>
        </SwipeableViews>
    )
}