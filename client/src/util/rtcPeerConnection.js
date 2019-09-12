function hasRtcPeerConnection(){
    window.RTCPeerConnection=window.RTCPeerConnection||window.webkitRTCPeerConnection||window.mozRTCPeerConnection;
    window.RTCSessionDescription=window.RTCSessionDescription||window.webkitRTCSessionDescription||window.mozRTCSessionDescription;
    window.RTCIceCandidate=window.RTCIceCandidate||window.webkitRTCIceCandidate||window.mozRTCIceCandidate;
    return !!window.RTCPeerConnection;
}

const iceServers={iceServers: [
    {
        urls:'turn:106.54.29.79:3478',
        username:'zimu',
        credential:'sad12345'
    }
]}
var rpc;

export function initRpc(){
    if(hasRtcPeerConnection()){
        rpc=new RTCPeerConnection(iceServers);
        rpc.onicecandidate =function(event){
            console.log(event);
        }
    }
}