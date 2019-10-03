import React from 'react'
import {IconButton}from '@material-ui/core'
import {Toys} from '@material-ui/icons'
import './css/explore.css'
import {useApp} from '../../context/appContext'

export default function Explore(){
    const {updateOpenUI}=useApp();
    return (
        <div id="explore">
            <div className="social" onClick={()=>{updateOpenUI('social')}}>
                <IconButton className="iconBox">
                    <Toys className="icon" />
                </IconButton>
                <span className="text">
                    朋友圈
                </span>
            </div>
        </div>
    )
}