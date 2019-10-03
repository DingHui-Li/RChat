import React from 'react'
import {Grid,Slide} from '@material-ui/core'
import Chat from './chat/index'
import PersonHome from './personHome'
import NewFriend from './newFriend/index'
import Social from './social/index'
import VAChat from './chat/VAChat'
import {useApp} from '../../context/appContext'

export default function Content(props){
    const {chatList_selected} = useApp();
    const {friendsList_selected} = useApp();
    const {msgData} = useApp();
    const {openUI}=useApp();
    return(
        <React.Fragment>
            <Grid item xs={12} sm={7} md={8} lg={9} className={'content'} 
                    style={{position:props.width==='xs'?'absolute':"relative",height:'auto'}}>

                <Slide in={chatList_selected!==-1} direction='left' timeout={300}>
                    <div style={{height:'auto',width:'100%'}}>
                        {
                            chatList_selected!==-1&&<Chat />
                        }
                    </div>
                </Slide>

                <Slide in={friendsList_selected!==-1} direction="left" timeout={300}>
                    <div style={{height:'auto',width:'100%'}}>
                        {
                            friendsList_selected!==-1&&<PersonHome />
                        }
                    </div>
                </Slide>

                <Slide in={openUI==='newFriend'} direction="left" timeout={300}>
                    <div style={{height:'auto',width:'100%'}}>
                        {
                            openUI==='newFriend'&&<NewFriend />
                        }
                    </div>
                </Slide>
                <Slide in={openUI==='social'} direction="left" timeout={300}>
                    <div style={{height:'auto',width:'100%'}}>
                        {
                            openUI==='social'&&<Social /> 
                        }
                    </div>
                </Slide>
            </Grid>
            <VAChat />
        </React.Fragment>
    )
}