import React from 'react'
import {Grid,Avatar,Typography} from '@material-ui/core'
import '../css/chatList.css'

export default function chat(){
    const arr=[1,2,3,4,5];
    return (
        <Grid container id="chat">
            {
                // arr.map(()=>
                //     <Grid item xs={12} className={'chatItem'}>
                //         <Avatar className="avatar">H</Avatar>
                //         <div className={'rightItem'}>
                //             <Typography noWrap={true} className={'name'}>昵称</Typography>
                //             <Typography noWrap={true} className={'time'}>23:00</Typography>
                //             <Typography noWrap={true} className={'lately'}>最近一条消息。</Typography>
                //         </div>
                //     </Grid>
                // )
            }
        </Grid>
    );
}