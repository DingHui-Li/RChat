import React, { useEffect } from 'react'
import {Grid,Avatar,Typography} from '@material-ui/core'
import '../css/chatList.css'
import {apiHost,imgHost} from '../config'
import {axiosInstance as Axios} from '../index'
import {useSnackbar} from 'notistack'
import {globalContext} from '../index'
export default function Friends(props){
    const [friendList,setFriendList]=React.useState([]);
    const {enqueueSnackbar}=useSnackbar();
    useEffect(()=>{
        Axios({
            method:'get',
            url:apiHost+'/friend/getFriendList',
        }).then(res=>{
            if(res.data.code===200){
                setFriendList(res.data.data);
                props.getFriends(res.data.data);
            }
            else{
                enqueueSnackbar(res.data.msg,{variant:'error'});
            }
        })
    },[])
        
   function selectFriend(friend){
        props.onFriendChange(friend);
   }
    return (
        friendList.map((item)=>
            <Grid container className={'friends'} key={item._id}>
                <Grid item xs={12} className={'chatItem'} onClick={()=>(selectFriend(item))}>
                    <Avatar className={'avatar'} src={imgHost+item.avatar}></Avatar>
                    <div className={'rightItem'} >
                        <Typography noWrap={true} className={'name'}>{item.name}</Typography>
                    </div>
                </Grid>
            </Grid>
        )
    );
}