import React from 'react'
import {Grid,Slide} from '@material-ui/core'
import Chat from './chat/index'
import PersonHome from './personHome'
import VAChat from './chat/VAChat'
// import {useChatList} from '../../context/chatListContext'
// import {useFriendsList} from '../../context/friendsListContext'
// import {useMsgData} from '../../context/msgContext'
import {useApp} from '../../context/appContext'

export default function Content(props){
    const {chatList_selected} = useApp();
    const {friendsList_selected} = useApp();
    const {msgData} = useApp();
    return(
        <React.Fragment>
            <Slide in={chatList_selected!==-1&&msgData.length>0} direction='left' timeout={300}>
                <Grid item xs={12} sm={7} md={8} lg={9}  className={'content'} 
                        style={{position:props.width==='xs'?'absolute':"relative"}}>
                    <Chat />
                </Grid>
            </Slide>
            <Slide in={friendsList_selected!==-1} direction="left" timeout={500}>
                <Grid item xs={12} sm={7} md={8} lg={9}  className={'content'} 
                        style={{position:props.width==='xs'?'absolute':"absolute",right:'0'}}>
                    <PersonHome />
                </Grid>
            </Slide>
            <VAChat />
        </React.Fragment>
    )
}