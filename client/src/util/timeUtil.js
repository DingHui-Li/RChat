
export function timeParse(time,detail){
    var weekday=new Array(7)
    weekday[0]="周日";
    weekday[1]="周一"
    weekday[2]="周二";
    weekday[3]="周三";
    weekday[4]="周四";
    weekday[5]="周五";
    weekday[6]="周六";
    let date=new Date(time);
    let date_ymd=formatDate(date,'yMd');
    let today=new Date();
    let today_ymd=formatDate(today,'yMd');

    let h=date.getHours();
    h=h<10?'0'+h:h;
    let m=date.getMinutes();
    m=m<10?'0'+m:m;
    if(date_ymd===today_ymd){//年月日相同
        return h+':'+m;
    }
    if(formatDate(date,'yM')===formatDate(today,'yM')){//年月相同
        if(today.getDate()-1===date.getDate()){
            if(detail)
                return '昨天 '+h+':'+m;
            else 
                return '昨天';
        }
        if((today.getDate()-7)<=date.getDate()){
            if(detail)
                return weekday[date.getDay()]+" "+h+':'+m;
            else 
                return weekday[date.getDay()];
        }
    }
    if(date.getFullYear()===today.getFullYear()){//年相同
        if(detail)
            return (date.getMonth()+1)+'月'+date.getDate()+'日 '+h+':'+m;
        else 
            return (date.getMonth()+1)+'月'+date.getDate()+'日 ';
    }
    return formatDate(date,'yMd');//都不同
}
function formatDate(dateStr,format){
    let date=new Date(dateStr);
    let y=date.getFullYear();
    let M=date.getMonth()+1;
    let d=date.getDate();

    if(format==='yMd') return y+'-'+M+'-'+d;
    if(format=='yM') return y+'-'+M;
}