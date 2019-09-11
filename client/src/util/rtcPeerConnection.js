export function hasRtcPeerConnection(){
    window.RTCPeerConnection=window.RTCPeerConnection||window.webkitRTCPeerConnection||window.mozRTCPeerConnection;
    window.RTCSessionDescription=window.RTCSessionDescription||window.webkitRTCSessionDescription||window.mozRTCSessionDescription;
    window.RTCIceCandidate=window.RTCIceCandidate||window.webkitRTCIceCandidate||window.mozRTCIceCandidate;
    return !!window.RTCPeerConnection;
}