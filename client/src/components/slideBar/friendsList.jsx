import React, { useEffect } from 'react'
import {Grid,Avatar,Typography,IconButton} from '@material-ui/core'
import {PersonAdd} from '@material-ui/icons'
import './css/chatList.css'
import './css/friendList.css'
import {apiHost,imgHost} from '../../config'
import {axiosInstance as Axios} from '../../index'
import {useSnackbar} from 'notistack'
import {useApp} from '../../context/appContext'
import Apply from './components/apply'

export default function Friends(){
    const {enqueueSnackbar}=useSnackbar();
    const {friendsList_data,update_friendsList,friendsList_selected,update_friendsListSelected}=useApp();
    const {applyList,updateApplyList}=useApp();
    const {updateOpenUI}=useApp();

    useEffect(()=>{
        Axios({
            method:'get',
            url:apiHost+'/friend/getFriendList',
        }).then(res=>{ 
            console.log(res.data)
            if(res.data.code===200){
                update_friendsList(res.data.data);
            }
            else{
                enqueueSnackbar(res.data.msg,{variant:'error'});
            }
        }).catch(err=>{
            enqueueSnackbar('服务器错误',{variant:'error'});
        });

        Axios({
            method:'get',
            url:apiHost+'/friend/getLatelyApply'
        }).then(res=>{
            if(res.data.code===200){
                updateApplyList(res.data.data);
            }
        })
    },[])
        
    useEffect(()=>{
        window.addEventListener('scroll',handleScroll);
        return ()=>{
            window.removeEventListener('scroll',handleScroll);
        }
    },[])
    function handleScroll(){
        console.log('x')
    }

    return (
        // <SwipeableViews axis="y" enableMouseEvents={true} resistance={true} style={{height:'100vh'}}>
            <Grid container id='friendList'>
                {
                    applyList.map(apply=>(
                        <Apply data={apply} key={apply._id}/>
                    ))
                }
                <div className="newFriendItem" onClick={()=>updateOpenUI('newFriend')}>
                    <IconButton disabled className="iconBox">
                        <PersonAdd className="icon" />
                    </IconButton>
                    <div className="text">新的朋友</div>
                </div>

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
                                {item.line?'[在线]':'[离线]'}
                                {item.descText}
                            </div>
                        </div>
                    </Grid>
                    )
                }
            </Grid>
        // </SwipeableViews>
    )
}