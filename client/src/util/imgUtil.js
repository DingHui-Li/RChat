import colorThief from 'colorthief'

export default function getImgInfo(file){//获取图片宽高和主色
    return new Promise(
        resolve=>{
            let reader=new FileReader();
            reader.readAsDataURL(file);
            reader.onload=function(e){
                let imgEle=document.createElement('img');
                imgEle.setAttribute('src',e.target.result);
                var img=new Image;
                img.src=e.target.result;
                img.onload= async function(){
                    const colorthief=new colorThief();  
                    let color = await colorthief.getColor(imgEle);
                    return resolve('w='+this.width+"&h="+this.height+'&color='+rgbToHex(color));
                }
            }
        }
    )
}
const rgbToHex = (rgb) =>rgb.map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}).join('')

export function parseImgInfo(path){
    let info=path.substr(path.indexOf('?'));
    let index1=info.indexOf('&');
    let index2=info.indexOf('&',index1+1);
    let w=info.substring(info.indexOf('w=')+2,index1);
    let h=info.substring(info.indexOf('h=')+2,index2);
    let color='#'+info.substr(info.indexOf('color=')+6);
    return {w:parseInt(w),h:parseInt(h),color}
}

export function compress(file,quality='middle'){
    return new Promise(resolve=>{
        let width=500;
        let height=500;
        if(quality==='middle'){
            width=1920;
            height=1080;
        }else if(quality==='high'){
            width=2560;
            height=1600;
        }
        let reader=new FileReader();
        reader.readAsDataURL(file);
        reader.onload=function(e){
            let img=new Image();
            img.src=e.target.result;
            img.onload=function(){
                if(img.width<=width||img.height<=height) return resolve(file);
                let canvas=document.createElement('canvas');
                let context=canvas.getContext('2d');
                let scale=img.width/img.height;
                canvas.height=height;
                let width=scale*height;
                canvas.width=width;
                context.drawImage(img,0,0,width,1080);
                let data=canvas.toDataURL('image/jpeg');
                return resolve(convertBase64UrlToBlob(data));
            }
        }
    })
}

function convertBase64UrlToBlob(urlData) {
    var arr = urlData.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
        type: mime
    });
}