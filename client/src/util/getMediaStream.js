export function getDisplayMedia(){//获取屏幕数据
    let getDisplayMediaOpt={
        video:{
            cursor:'always'
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
        }
    }
    return navigator.mediaDevices.getDisplayMedia(getDisplayMediaOpt).then(function(stream){
            return stream;
        }).catch(function(err){
            console.log(err);
            return null;
    })
}
export function getCameraMedia(type){//获取摄像头数据
    let opt={
        //audio:true,
        video:{
            facingMode:type,
        }
    }
    return navigator.mediaDevices.getUserMedia(opt).then(function(stream){
            return stream;
        }).catch(function(err){
            console.log(err);
            return null;
        })
}
export async function initMediaStream(){
    let stream=null;
    stream=await getCameraMedia('user');
    if(stream) {
        return stream;
    }
    stream=await  getCameraMedia('environment');//若获取不到，则获取后摄像头                  
    if(stream){
        return stream;
    } 
    stream=await  getDisplayMedia();//若获取不到，则捕获屏幕
    return stream;
}