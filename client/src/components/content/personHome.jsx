import React, { useEffect, useState } from 'react'
import {Grid,Card,Avatar,CardContent,ButtonBase,IconButton,Slide,Popper,Paper,Grow} from '@material-ui/core'
import {Chat,LocalPhone,Videocam,Delete,PersonAdd,Close,Room,Check,Close as CloseIcon} from '@material-ui/icons'
import './css/personHome.css'
import {axiosInstance as Axios} from '../../index'
import {apiHost,imgHost,chatSocket} from '../../config'
import {useApp} from '../../context/appContext'
import { useGlobal } from '../../context/globalContext';
import {useSnackbar} from 'notistack'
import {findIndex} from '../../util/arrayUtil'


export default function PersonHome(props){
    const {friendsList_selected,update_friendsListSelected}=useApp();
    const {friendsList_data, update_friendsList}=useApp();
    const {update_chatListSelected}=useApp();
    const {userInfo}=useGlobal();
    const {enqueueSnackbar} =useSnackbar();

    const [info,setInfo]=useState({
            'avatar':'/avatar.png',
            'name':'未知',
            'descText':'...',
            'sex':'male',
            'location':'中国 北京'
    });
    const [delAnchor,setDelAnchor]=React.useState(null);
    const [isFriend,setIsFriend]=React.useState(false);
    useEffect(()=>{
        setIsFriend(null);
        let id=friendsList_selected._id
        if(!id) return;
        Axios({
            method:'get',
            url:apiHost+'/user/getInfo?id='+id,
        }).then(res=>{
            if(res.data.info.code===200){
                setInfo(res.data.info.data);
                setIsFriend(res.data.isFriend.isFriend);
            }else{
                enqueueSnackbar('服务器错误',{variant:"error"});
            }
        }).catch(err=>{
            enqueueSnackbar('网络错误',{variant:"error"});
        })
    },[friendsList_selected]);
    function handleAddFriend(){
        if(chatSocket.connected){
            chatSocket.emit('apply',{'user':userInfo._id,'friend':friendsList_selected._id},function(res){
                enqueueSnackbar(res.msg,{variant:'success'});
            })
        }
    }
    function handleDeleteFriend(){
        setDelAnchor(null);
        Axios({
            method:'post',
            url:apiHost+'/friend/delete',
            data:{'id':friendsList_selected._id}
        }).then(res=>{
            if(res.data.code===200){
                setIsFriend(false);
                enqueueSnackbar('删除成功',{variant:'success'});
                let index=findIndex(friendsList_data,'_id',friendsList_selected._id);
                if(index!==-1){
                    let temp=friendsList_data.slice();
                    temp.splice(index,1);
                    update_friendsList(temp);
                }
            }else if(res.data.code===300){
                enqueueSnackbar(res.data.msg,{autoHideDuration:5000,variant:'info'});
            }else{
                enqueueSnackbar('删除失败：'+res.data.msg,{autoHideDuration:5000,variant:'error'});
            }
        }).catch(err=>{
            enqueueSnackbar("网络错误",{variant:'error'})
        })
    }
    return(
                <Grid xs={12} item container className="personHome" justify="center" alignItems="center">
                <Grid item xs={12} md={10} lg={8} xl={6}  >
                    <Slide in={isFriend!==null} timeout={400}>
                        <Card elevation={2} className="card">
                            <IconButton className="closeBtn" onClick={()=>{update_friendsListSelected(-1)}}>
                                <Close />
                            </IconButton>
                            <div className="avatar_cover">
                                <img src={imgHost+info.cover} className="cover" />
                                <Avatar src={imgHost+info.avatar} className="avatar"/>
                            </div>
                            <CardContent style={{padding:'0',position:'relative'}}>
                                <div className="name">{info.name}
                                    <img src={info.sex==='male'?require("../../asset/male.png"):require("../../asset/female.png")} className="sexIcon" />
                                </div>
                                <div className="location">
                                    <Room className="icon"/>
                                    <span style={{verticalAlign:'middle'}}>{info.location}</span> 
                                </div>
                                <div className='sign'>{info.descText}</div>
                                {
                                    friendsList_selected._id!==userInfo._id&&
                                    <div>
                                        <IconButton className="sendMsgBtn" onClick={()=>{
                                            friendsList_selected.action='normal';
                                            update_chatListSelected(friendsList_selected);
                                        }}>
                                            <Chat style={{color:'#fff'}} className='buttonIcon'/>
                                        </IconButton>
                                        <ButtonBase variant="contained" className="button" style={{marginTop:'20px'}}>
                                            <LocalPhone className='buttonIcon'/>
                                            语音通话
                                        </ButtonBase>
                                        <ButtonBase variant="contained" className="button" style={{borderTop:'1px solid #e0e0e0'}} 
                                            onClick={()=>{
                                                friendsList_selected.action='callVideo';
                                                update_chatListSelected(friendsList_selected);
                                            }}>
                                            <Videocam className='buttonIcon'/>
                                            视频通话
                                        </ButtonBase>
                                        {
                                            isFriend===true&&
                                            <ButtonBase variant="contained" className="button" style={{backgroundColor:'#F44336',color:'#fff'}} onClick={(e)=>setDelAnchor(e.currentTarget)}>
                                                <Delete className='buttonIcon'/>
                                                删除
                                            </ButtonBase>
                                        }
                                        {   isFriend===false&&
                                            <ButtonBase variant="contained" className="button" style={{backgroundColor:'#4CAF50',color:'#fff'}} onClick={handleAddFriend}>
                                                <PersonAdd className='buttonIcon'/>
                                                添加为好友
                                            </ButtonBase>
                                        }
                                    </div>
                                }
                                <Popper open={Boolean(delAnchor)} anchorEl={delAnchor} placement='top' transition>
                                        {
                                            ({TransitionProps})=>(
                                                <Grow {...TransitionProps}>
                                                    <Paper id="delPopper" elevation={20}>
                                                        <div className="arrow"></div>
                                                        <div>确定删除？</div>
                                                        <div className="action">
                                                            <IconButton style={{backgroundColor:'#4CAF50',width:'40px',height:'40px'}} onClick={handleDeleteFriend}>
                                                                <Check className="icon" />
                                                            </IconButton>
                                                            <IconButton  style={{backgroundColor:'#D32F2F',marginLeft:'30px',width:'40px',height:'40px'}}
                                                                onClick={()=>setDelAnchor(null)}>
                                                                <CloseIcon className="icon"/>
                                                            </IconButton>
                                                        </div>
                                                    </Paper>
                                                </Grow>
                                            )
                                        }
                                </Popper>
                            </CardContent>
                        </Card>
                    </Slide>
                </Grid>
                </Grid>
    )
}