!function(n){function e(n,e){var t={};t.action="check.user.get.actuator.list",t.username=n,console.log(t),$.ajax({url:"http://"+f+":8080/SEIoT/actuator",type:"post",data:t,success:function(n){var t=JSON.parse(n);h=t,console.log(h),e()},error:function(n){e()}})}function t(){return o()+o()+"-"+o()+"-"+o()+"-"+o()+"-"+o()+o()+o()}function o(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}function s(){try{(p=new Paho.MQTT.Client("ws://"+d+":11883/","Scratch_client"+t())).onConnectionLost=function(n){l=!1,console.log("connection lost: "+n.errorMessage),setTimeout(p.connect(),100)},p.onMessageArrived=function(n){console.log(n.destinationName," -- ",n.payloadString);var e=n.destinationName.split("/");if(3==e.length){var t=e[0],o=e[1],s=e[2],c=n.payloadString;t in b==0&&(b[t]={}),o in b[t]==0&&(b[t][o]={}),b[t][o][s]=c}}}catch(n){console.log(n)}}function c(n){var e={timeout:3,onSuccess:function(){l=!0,console.log("mqtt connected")},onFailure:function(n){l=!1,console.log("Connection failed: "+n.errorMessage)},userName:i,password:r};p.connect(e),window.setTimeout(function(){console.log("reconnect!"),n()},1e3)}n._shutdown=function(){},n._getStatus=function(){return{status:2,msg:"Ready"}};var i,r,a=!1,l=!1,u=/^([0-9a-zA-Z])+$/,g=/^([0-9a-zA-Z/#+])+$/,f="140.113.216.245",d="140.113.216.245";n.connectToServer=function(n,t){var o=[];if(2!=(o=n.split(":")).length)return console.log("Invalid key format."),a=!1,void t();if(i=o[0],r=o[1],0==u.test(i)||0==u.test(r))return console.log("Your string contains illegal characters."),a=!1,void t();var s={};s.username=i,s.hashedPass=r,console.log(i+":"+r),$.ajax({url:"http://"+f+":8080/SEIoT/auth_user",type:"post",data:s,success:function(n){if("1"!=JSON.parse(n)[0].isPassAuth)return a=!1,h={},void t();a=!0,e(i,function(){p.isConnected()?t():c(function(){t()})})},error:function(n){t()}})},n.connectSuccess=function(){return console.log("身分驗證:"+a+", 連到MQTT:"+l+", client.isConnected() --\x3e"+p.isConnected()),0==(a&&l)?0:1},n.subscribeTopic=function(n){0!=(a&&l)&&(0!=g.test(n)?(p.subscribe(n,{qos:0}),console.log("subscribe:"+n)):console.log("Your string contains illegal characters."))},n.unsubscribeTopic=function(n){0!=(a&&l)&&(0!=g.test(n)?(p.unsubscribe(n),console.log("unsubscribe:"+n)):console.log("Your string contains illegal characters."))};var h={};n.checkUserGetActuator=function(n,e,t){if(0!=(a&&l))if(0!=u.test(n)&&0!=u.test(e)&&0!=u.test(t)){if(n in h!=0&&e in h[n]!=0&&t in h[n][e]!=0)return 1}else console.log("Your string contains illegal characters.")},n.getMetricValue=function(n,e,t){if(0!=(a&&l))if(0!=u.test(n)&&0!=u.test(e)&&0!=u.test(t)){if(0!=b[n][e][t])return b[n][e][t]}else console.log("Your string contains illegal characters.")},n.setMetricValue=function(n,e,t,o){0!=(a&&l)&&(0!=u.test(n)&&0!=u.test(e)&&0!=u.test(t)?n in h!=0&&e in h[n]!=0&&t in h[n][e]!=0&&(console.log(o),message=new Paho.MQTT.Message(o.toString()),message.destinationName=n+"/"+e+"/"+t,p.send(message)):console.log("Your string contains illegal characters."))};var T={blocks:[["w","我的金鑰 %s 連線到系統","connectToServer","使用者金鑰"],["r","成功連線","connectSuccess"],[" ","訂閱主題 %s","subscribeTopic","主題"],[" ","取消訂閱主題 %s","unsubscribeTopic","主題"],["r","可否取得 %s 的 %s 裝置的屬性 %s","checkUserGetActuator","提供者","裝置名稱","量測數值名稱"],["r","取得 %s 的 %s 裝置的屬性 %s 的值","getMetricValue","提供者","裝置名稱","量測數值名稱"],[" ","設定 %s 的 %s 裝置的屬性 %s 的值為 %s","setMetricValue","提供者","裝置名稱","量測數值名稱","值"]]};ScratchExtensions.register("IoT Extension",T,n),function(){$.getScript("http://"+f+":8080/SEIoT/js/mqttws31.js").done(function(n,e){console.log("Loaded MQTT"),s()}).fail(function(n,e,t){console.log("Error loading MQTT")})}();var p,b={}}({});
