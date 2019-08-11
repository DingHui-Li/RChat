import React from 'react';
import {Grid,Paper,Tabs,Tab} from '@material-ui/core'
import '../css/app.css'
import SwipeableViews from 'react-swipeable-views'
import Chart from './chat.jsx'
import Friends from './friends.jsx'

export default function App() {
  const [value,setVal]=React.useState(0);
  function tabChange(e,val){
    setVal(val);
  }
  function swiperChange(index){
    setVal(index);
  }
  return (
    <Grid container>
        <Grid item xs={12} sm={5} md={4} lg={3}  className={'sideNav'}>
          <Paper className={'tab'} elevation={2}>
            <Tabs indicatorColor="primary" textColor="primary"  variant="fullWidth" value={value} onChange={tabChange}>
              <Tab label='1'/>
              <Tab label='2'/>
              <Tab label='3'/>
            </Tabs>
          </Paper>
          <SwipeableViews index={value} onChangeIndex={swiperChange} style={{height:'100%'}}>
            <Chart />
            <Friends />
            <div>3</div>
          </SwipeableViews>
        </Grid>
        <Grid item xs={12} sm={7} md={8} lg={9}  className={'content'}>
          
        </Grid>
    </Grid>
  );
}