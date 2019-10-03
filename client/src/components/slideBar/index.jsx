import React from 'react'
import {Grid,Avatar,Paper,Tabs,Tab,Menu,MenuItem} from '@material-ui/core'
import {ChatBubble,ContactPhone,Explore as ExploreIcon} from '@material-ui/icons'
import SwipeableViews from 'react-swipeable-views'
import ChatList from './chatList'
import {imgHost,apiHost} from '../../config'
import{useGlobal} from '../../context/globalContext'
import Friends from './friendsList'
import {axiosInstance as Axios} from '../../index'
import './css/slideBar.css'
import {useSnackbar} from 'notistack'
import {withRouter} from 'react-router-dom'
import {useApp} from '../../context/appContext'
import Search from './components/search'
import Explore from './explore'

function SlideBar(props){
    const [value,setVal]=React.useState(0);//Tab -index
    const {userInfo}=useGlobal();
    const [menuAnch,setMenuAnch]=React.useState(null);
    const {isLine}=useApp();

    const {enqueueSnackbar}=useSnackbar();
    const {update_friendsListSelected}=useApp();
    const {update_chatListSelected}=useApp();


    function tabChange(e,val){
        setVal(val);
    }
    function swiperChange(index){
        setVal(index);
    }
    function logout(){
        setMenuAnch(null);
        Axios({
            type:'get',
            url:apiHost+'/user/logout'
        }).then(res=>{
            if(res.data.code===200){
                props.history.push('/login')
            }else{
                enqueueSnackbar('服务器错误',{variant:'error'});
            }
        }).catch(err=>{
            console.log(err)
            enqueueSnackbar('网络错误',{variant:'error'});
        })
    }

    return(
        <Grid item xs={12} sm={5} md={4} lg={3}  className='sideNav'>
            <div className="userInfo" onClick={(e)=>{setMenuAnch(e.currentTarget)}}>
                <Avatar src={imgHost+userInfo.avatar} className="avatar"></Avatar>
                <div className="lineState" style={{backgroundColor:isLine?'#4CAF50':'#FF5252'}}></div>
                <span className="name">{userInfo.name}</span>
            </div>
            <Search />
            <Menu anchorEl={menuAnch} keepMounted open={Boolean(menuAnch)} onClose={()=>setMenuAnch(null)}>
                <MenuItem onClick={()=>{
                    setMenuAnch(null);
                    update_friendsListSelected(userInfo);
                    update_chatListSelected(-1);
                }}>个人主页</MenuItem>
                <MenuItem onClick={()=>logout()}>退出登陆</MenuItem>
            </Menu>
            <Paper className='tab' elevation={0}>
                <Tabs indicatorColor="primary" textColor="primary"  variant="fullWidth" value={value} onChange={tabChange} className="tabs">
                    <Tab label='消息' icon={<ChatBubble />}/>
                    <Tab label='联系人' icon={<ContactPhone />}/>
                    <Tab label="发现" icon={<ExploreIcon />} />
                </Tabs>
            </Paper>
            <SwipeableViews index={value} onChangeIndex={swiperChange} style={{height:'100%'}}>
                <ChatList></ChatList>
                <Friends/>
                <Explore />
            </SwipeableViews>
        </Grid> 
    )
}
export default withRouter(SlideBar);