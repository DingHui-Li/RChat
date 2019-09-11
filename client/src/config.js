export const apiHost='http://localhost:4000';
export const imgHost="http://localhost:4000/images";
export const chatSocket=require('socket.io-client')(apiHost+'/chat',{
    reconnection:false
});
export const iceServers={iceServers: [
                            {
                                urls:'turn:106.54.29.79:3478',
                                username:'zimu',
                                credential:'sad12345'
                            }
                        ]}