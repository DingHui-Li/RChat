import React, { useEffect } from 'react'
import {Grid,Card,CardMedia,CardContent,ButtonBase,Fade} from '@material-ui/core'
import {Chat,LocalPhone,Videocam,Delete} from '@material-ui/icons'
import '../css/personHome.css'
import {friendContext} from '../views/App'
import {axiosInstance as Axios} from '../index'
import {apiHost,imgHost} from '../config'

export default function PersonHome(){
    const selectFriend=React.useContext(friendContext).selectFriend;
    useEffect(()=>{
        console.log(selectFriend)
    })
    return(
        <Grid item xs={12} className="personHome">
            <Fade in={true}>
            <Card elevation={0} className="card">
                <CardMedia image={imgHost+selectFriend.avatar} style={{height:'300px'}} />
                <CardContent style={{padding:'0'}}>
                    <div className="name">{selectFriend.name}</div>
                    <div className='sign'>明者因时而变，知者随事而制，强者乘势而进.</div>

                    <ButtonBase variant="contained" className="button">
                        <Chat className='buttonIcon'/>
                        发送消息 
                    </ButtonBase>
                    <ButtonBase variant="contained" className="button">
                        <LocalPhone className='buttonIcon'/>
                        语音通话
                    </ButtonBase>
                    <ButtonBase variant="contained" className="button">
                        <Videocam className='buttonIcon'/>
                        视频通话
                    </ButtonBase>
                    <ButtonBase variant="contained" className="button" style={{backgroundColor:'#F44336',color:'#fff'}}>
                        <Delete className='buttonIcon'/>
                        删除
                    </ButtonBase>
                </CardContent>
            </Card>
            </Fade>
        </Grid>
    )
}