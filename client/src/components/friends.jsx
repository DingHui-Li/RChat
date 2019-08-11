import React from 'react'
import {Grid,Avatar,Typography} from '@material-ui/core'
import '../css/chat.css'
export default function friends(){
    const arr=[1,2,3,4,5];
    return (
        arr.map(()=>
            <Grid container className={'friends'}>
                <Grid item xs={12} className={'chatItem'}>
                    <Avatar className={'avatar'}>S</Avatar>
                    <div className={'rightItem'}>
                        <Typography noWrap={true} className={'name'}>昵称</Typography>
                    </div>
                </Grid>
            </Grid>
        )
    );
}