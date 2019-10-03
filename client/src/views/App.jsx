import React, { useEffect } from 'react';
import {Grid,withWidth} from '@material-ui/core'
import './css/app.css'
import {withRouter} from 'react-router-dom'
import{useGlobal} from '../context/globalContext'
import CheckSession from './components/CheckSession'
import MsgRemind from '../components/content/chat/msgRemind'
import SlideBar from '../components/slideBar/index'
import Content from '../components/content/index'
import Appcontext from '../context/appContext'


function App(props) {
  const {userInfo}=useGlobal();
  return (
    <Appcontext>
      <CheckSession userid={userInfo._id} />
        <Grid container  style={{position:'fixed'}}>   
              <SlideBar />
              <Content width={props.width} />
              <MsgRemind />
        </Grid>
    </Appcontext>
  );
}
export default withWidth()(withRouter(App));