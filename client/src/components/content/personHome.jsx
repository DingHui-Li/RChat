import React, { useEffect } from 'react'
import {Grid,Card,CardMedia,CardContent,ButtonBase,IconButton,Fade,Hidden,Button,} from '@material-ui/core'
import {Chat,LocalPhone,Videocam,Delete,ArrowBack,Close} from '@material-ui/icons'
import './css/personHome.css'
import {axiosInstance as Axios} from '../../index'
import {apiHost,imgHost} from '../../config'
// import {useFriendsList} from '../../context/friendsListContext'
import {useApp} from '../../context/appContext'
import { globalContext } from '../../index';

export default function PersonHome(){
    const {friendsList_selected,update_friendsListSelected}=useApp();
    const userInfo=React.useContext(globalContext).userInfo;
    const {chatList_data,update_chatListSelected}=useApp();
    return(
        <Grid item container xs={12} className="personHome" justify="center" alignItems="center">
            {friendsList_selected!==-1&&
                <Grid item xs={12} md={10} lg={8} xl={6}>
                <Card elevation={2} className="card">
                    <IconButton className="closeBtn" onClick={()=>{update_friendsListSelected(-1)}}>
                        <Close />
                    </IconButton>
                    <CardMedia image={imgHost+friendsList_selected.avatar} style={{height:'300px'}} />
                    <CardContent style={{padding:'0',position:'relative'}}>
                        <div className="name">{friendsList_selected.name}</div>
                        <div className='sign'>明者因时而变，知者随事而制，强者乘势而进.</div>
                        {
                            friendsList_selected._id!==userInfo._id&&
                            <div>
                                <IconButton className="sendMsgBtn" onClick={()=>{
                                    friendsList_selected.action='normal';
                                    update_chatListSelected(friendsList_selected);
                                }}>
                                    <Chat style={{color:'#fff'}} className='buttonIcon'/>
                                </IconButton>
                                <ButtonBase variant="contained" className="button">
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
                                <ButtonBase variant="contained" className="button" style={{backgroundColor:'#F44336',color:'#fff'}}>
                                    <Delete className='buttonIcon'/>
                                    删除
                                </ButtonBase>
                            </div>
                        }
                    </CardContent>
                </Card>
                </Grid>
            }
        </Grid>
    )
}