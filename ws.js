!function(e){function n(e,n){var o={};o.action="check.user.get.actuator.list",o.username=e,console.log(o),$.ajax({url:"http://"+u+":8080/SEIoT/actuator",type:"post",data:o,success:function(e){var o=JSON.parse(e);f=o,console.log(f),n()},error:function(e){n()}})}function o(){try{(h=new Paho.MQTT.Client("ws://"+g+":11883/","myclientid_"+parseInt(10000*Math.random(),10))).onConnectionLost=function(e){r=!1,console.log("connection lost: "+e.errorMessage),setTimeout(h.connect(),100)},h.onMessageArrived=function(e){console.log(e.destinationName," -- ",e.payloadString);var n=e.destinationName.split("/");if(3==n.length){var o=n[0],t=n[1],s=n[2],c=e.payloadString;o in T==0&&(T[o]={}),t in T[o]==0&&(T[o][t]={}),T[o][t][s]=c}}}catch(e){console.log(e)}}function t(e){var n={timeout:3,onSuccess:function(){r=!0,console.log("mqtt connected")},onFailure:function(e){r=!1,console.log("Connection failed: "+e.errorMessage)},userName:s,password:c};h.connect(n),window.setTimeout(function(){console.log("reconnect!"),e()},1e3)}e._shutdown=function(){},e._getStatus=function(){return{status:2,msg:"Ready"}};var s,c,i=!1,r=!1,a=/^([0-9a-zA-Z])+$/,l=/^([0-9a-zA-Z/#+])+$/,u="140.113.216.245",g="140.113.216.245";e.connectToServer=function(e,o){var r=[];if(2!=(r=e.split(":")).length)return console.log("Invalid key format."),i=!1,void o();if(s=r[0],c=r[1],0==a.test(s)||0==a.test(c))return console.log("Your string contains illegal characters."),i=!1,void o();var l={};l.username=s,l.hashedPass=c,console.log(s+":"+c),$.ajax({url:"http://"+u+":8080/SEIoT/auth_user",type:"post",data:l,success:function(e){if("1"!=JSON.parse(e)[0].isPassAuth)return i=!1,f={},void o();i=!0,n(s,function(){h.isConnected()?o():t(function(){o()})})},error:function(e){o()}})},e.connectSuccess=function(){return console.log("身分驗證:"+i+", 連到MQTT:"+r+", client.isConnected() --\x3e"+h.isConnected()),0==(i&&r)?0:1},e.subscribeTopic=function(e){0!=(i&&r)&&(0!=l.test(e)?(h.subscribe(e,{qos:0}),console.log("subscribe:"+e)):console.log("Your string contains illegal characters."))},e.unsubscribeTopic=function(e){0!=(i&&r)&&(0!=l.test(e)?(h.unsubscribe(e),console.log("unsubscribe:"+e)):console.log("Your string contains illegal characters."))};var f={};e.checkUserGetActuator=function(e,n,o){if(0!=(i&&r))if(0!=a.test(e)&&0!=a.test(n)&&0!=a.test(o)){if(e in f!=0&&n in f[e]!=0&&o in f[e][n]!=0)return 1}else console.log("Your string contains illegal characters.")},e.getMetricValue=function(e,n,o){if(0!=(i&&r))if(0!=a.test(e)&&0!=a.test(n)&&0!=a.test(o)){if(0!=T[e][n][o])return T[e][n][o]}else console.log("Your string contains illegal characters.")},e.setMetricValue=function(e,n,o,t){0!=(i&&r)&&(0!=a.test(e)&&0!=a.test(n)&&0!=a.test(o)?e in f!=0&&n in f[e]!=0&&o in f[e][n]!=0&&(console.log(t),message=new Paho.MQTT.Message(t.toString()),message.destinationName=e+"/"+n+"/"+o,h.send(message)):console.log("Your string contains illegal characters."))};var d={blocks:[["w","我的金鑰 %s 連線到系統","connectToServer","使用者金鑰"],["r","成功連線","connectSuccess"],[" ","訂閱主題 %s","subscribeTopic","主題"],[" ","取消訂閱主題 %s","unsubscribeTopic","主題"],["r","可否取得 %s 的 %s 裝置的屬性 %s","checkUserGetActuator","提供者","裝置名稱","量測數值名稱"],["r","取得 %s 的 %s 裝置的屬性 %s 的值","getMetricValue","提供者","裝置名稱","量測數值名稱"],[" ","設定 %s 的 %s 裝置的屬性 %s 的值為 %s","setMetricValue","提供者","裝置名稱","量測數值名稱","值"]]};ScratchExtensions.register("MQTT Extension",d,e),function(){$.getScript("http://"+u+":8080/SEIoT/js/mqttws31.js").done(function(e,n){console.log("Loaded MQTT"),o()}).fail(function(e,n,o){console.log("Error loading MQTT")})}();var h,T={}}({});
