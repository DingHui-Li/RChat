//export const apiHost='http://localhost:4000';
export const apiHost='https://chat.lidh.top/server';
export const imgHost=apiHost;
export const chatSocket=require('socket.io-client')(apiHost+'/chat',{
    reconnection:false
});
export const iceServers={iceServers: [
                            {
                                urls:"stun:106.54.29.79:3478"
                            }
                        ]}