import React from 'react';
import {Grid,withWidth} from '@material-ui/core'
import './css/app.css'
import {withRouter} from 'react-router-dom'
import{globalContext} from '../index'
import useCheckSession from './Hooks/useCheckSession'
import MsgRemind from '../components/content/chat/msgRemind'
import SlideBar from '../components/slideBar/index'
import Content from '../components/content/index'
import Appcontext from '../context/appContext'


function App(props) {
  const userInfo=React.useContext(globalContext).userInfo;

  useCheckSession(userInfo._id).then(isLogin=>{//检查登陆状态
      if(!isLogin) props.history.push('/login');
  });

  return (
    <Appcontext>
        <Grid container  style={{position:'fixed'}}>   
              <SlideBar />
              <Content width={props.width} />
              <MsgRemind />
        </Grid>
    </Appcontext>
  );
}
export default withWidth()(withRouter(App));