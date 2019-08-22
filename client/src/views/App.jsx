import React, { useEffect } from 'react';
import {Grid,Paper,Tabs,Tab,Avatar,Hidden,Button,Slide} from '@material-ui/core'
import {ChatBubble,ContactPhone} from '@material-ui/icons'
import '../css/app.css'
import SwipeableViews from 'react-swipeable-views'
import ChatList from '../components/chatList.jsx'
import Friends from '../components/friendsList.jsx'
import Chat from '../components/chat'
import {withRouter} from 'react-router-dom'
import {apiHost,imgHost,chatSocket} from '../config'
import {axiosInstance as Axios} from '../index'
import {useSnackbar} from 'notistack'
import{globalContext} from '../index'

export const friendContext=React.createContext();//选中好友列表中的一个数据
export const friendsContext=React.createContext();//好友列表数据

function App(props) {
  const userInfo=React.useContext(globalContext).userInfo;
  const {enqueueSnackbar,closeSnackbar} =useSnackbar();

  const reConnect=(key)=>(
    <Button onClick={()=>{
      chatSocket.open();
      chatSocket.emit('newConnect',{userid:userInfo.id});
       closeSnackbar(key)
      }}>重新连接</Button>
  );


  (
    function(){
      Axios({
          method:'get',
          url:apiHost+'/user/checksession'
        }).then(res=>{
          if(res.data.code===400){
            props.history.push('/login');
          }
          else if(res.data.code===200){
            chatSocket.emit('newConnect',{userid:userInfo.id});
            chatSocket.on('connect',function(socket){
              enqueueSnackbar('已连接',{
                  variant:'success',
                  preventDuplicate:true,
                  anchorOrigin:{
                    vertical:'top',
                    horizontal:'center'
                }
              })
            })
            chatSocket.on('disconnect',function(socket){
              enqueueSnackbar('断开连接',{
                variant:'error',
                action:reConnect,
                persist:true,
                preventDuplicate:true,
                anchorOrigin:{
                  vertical:'top',
                  horizontal:'center'
                }
              });
            });
            chatSocket.on('error',function(){
              enqueueSnackbar('连接错误',{
                variant:'error',
                action:reConnect,
                preventDuplicate:true,
                anchorOrigin:{
                  vertical:'top',
                  horizontal:'center'
                }
              });
            })
          }
        })
    }
  )()

  
  const [value,setVal]=React.useState(0);//Tab -index
  const [selectFriend,setSelectFriend]=React.useState(-1);//chat界面的好友信息
  const [friends,setFriends] =React.useState([]);

  function getFriends(data){
    setFriends(data);
  }
  function tabChange(e,val){
    setVal(val);
  }
  function swiperChange(index){
    setVal(index);
  }
  function updateSelect(friend){
    setSelectFriend(friend);
  }
  return (
      <Grid container  style={{position:'fixed'}}>   
          <Grid item xs={12} sm={5} md={4} lg={3}  className={'sideNav'}>
            <div className="userInfo">
                <Avatar src={imgHost+userInfo.avatar} className="avatar"></Avatar>
                <span className="name">{userInfo.name}</span>
            </div>
            <Paper className={'tab'} elevation={0}>
              <Tabs indicatorColor="primary" textColor="primary"  variant="fullWidth" value={value} onChange={tabChange} className="tabs">
                <Tab label='消息' icon={<ChatBubble />}/>
                <Tab label='联系人' icon={<ContactPhone />}/>
                <Tab label='3'/>
              </Tabs>
            </Paper>
            <SwipeableViews index={value} onChangeIndex={swiperChange} style={{height:'100%'}}>
              <ChatList></ChatList>
              <Friends onFriendChange={updateSelect} getFriends={getFriends}/>
              <div>3</div>
            </SwipeableViews>
          </Grid>
          <Hidden mdDown>   
            <friendsContext.Provider value={friends}>
            <friendContext.Provider value={{'updateSelect':updateSelect,'selectFriend':selectFriend}}>
              <Grid item xs={12} sm={7} md={8} lg={9}  className={'content'}>
                    <Chat></Chat>
              </Grid>
            </friendContext.Provider>
            </friendsContext.Provider>
          </Hidden>
          <Hidden mdUp>   
            <friendsContext.Provider value={friends}>
            <friendContext.Provider value={{'updateSelect':updateSelect,'selectFriend':selectFriend}}>
              {
                  <Slide in={selectFriend!==-1} direction="right">
                    <Grid item xs={12} className={'content'} style={{position:"absolute"}}>
                        <Chat></Chat>
                    </Grid>
                  </Slide>
              }
            </friendContext.Provider>
            </friendsContext.Provider>
          </Hidden>
      </Grid>
    
  );
}
export default withRouter(App);