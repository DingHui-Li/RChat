export const apiHost='http://localhost:4000'
export const imgHost="http://localhost:4000/images"
export const chatSocket=require('socket.io-client')(apiHost+'/chat',{
    reconnection:false
});