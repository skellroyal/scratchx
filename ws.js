(function(ext) {
    
    function loadMQTT() {
        $.getScript('http://192.168.2.109:8080/SEIoT/js/mqttws31.js')
        .done(function(script, textStatus) {
            console.log('Loaded MQTT');
            connectMQTT();
        })
        .fail(function(jqxhr, settings, exception) {
            console.log('Error loading MQTT');
        });
    }
    
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    // Functions for block with type 'w' will get a callback function as the 
    // final argument. This should be called to indicate that the block can
    // stop waiting.

    var isPassAuth = 0;
    var isGetActuator = 0;
    var user = "";
    
    /* 連線到系統驗正使用者身分 */
    ext.connectToServer = function(username, callback){
    	/* 呼叫ajax驗證使用者名稱 */
    	var values = {};
    	values['username'] = username;
    	console.log(username);
    	$.ajax({
    		url:'http://192.168.2.109:8080/SEIoT/auth_user',
    		type : 'post',
    		data : values,
    		success : function(data) {
    			var json = JSON.parse(data);
    			if (json[0]["isPassAuth"] == "1") {
    				isPassAuth = 1;
    				user = username; //設定使用者名稱供全域使用
    			} else {
    				isPassAuth = 0;
    			}
    			callback();
    		},
    		error : function(e) {
    		}
    	});
    }
    
    ext.connectSuccess = function(){
    	return isPassAuth;
    }
    
    ext.subscribeTopic = function(topic){
    	if (isPassAuth == 0)
    		return;
    	client.subscribe(topic, {qos: 0});
    }

    ext.checkUserGetActuator = function(provider, device, metric, callback){
    	if (isPassAuth == 0)
    		callback(0);
    	
    	/* 呼叫ajax檢查使用者是否取得致動器控制權限 */
    	var values = {};
    	values['action'] = 'check.user.get.actuator';
    	values['username'] = user;
    	values['provider_name'] = provider;
    	values['device_name'] = device;
    	values['metric_name'] = metric;
    	console.log(values);
    	$.ajax({
    		url:'http://192.168.2.109:8080/SEIoT/actuator',
    		type : 'post',
    		data : values,
    		success : function(data) {
    			var json = JSON.parse(data);
    			if (json[0]["isGetActuator"] == "1") {
    				isGetActuator = 1;
    			} else {
    				isGetActuator = 0;
    			}
    			callback(isGetActuator);
    		},
    		error : function(e) {
    		}
    	});
    }
    
    /*ext.getActuatorSuccess = function(){
    	return isGetActuator;
    }*/
    
    ext.getMetricValue = function(provider, device, metric){
    	return 20.6;
    }
    var control = {};
    ext.setMetricValue = function(provider, device, metric, value){
    	if (isPassAuth == 0)
    		return;
    	
    	/* 增加判端是否取得致動器控制權限 */
    	
    	
    	
    	
    	console.log(value);
        message = new Paho.MQTT.Message(value.toString());
        message.destinationName = provider + "/" + device + "/" + metric;
        client.send(message);
    }

    ext.disconnet = function(){
        var state = client.disconnect();
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', '我是 %s 連線到系統','connectToServer', '使用者名稱'],
            ['r', '成功連線','connectSuccess'],
            [' ', '訂閱主題 %s','subscribeTopic', '主題'],
            ['R', '檢查是否取得 %s 的 %s 裝置的屬性 %s', 'checkUserGetActuator', '提供者', '裝置名稱', '量測數值名稱'],
            /*['r', '成功取用','getActuatorSuccess'],*/
            ['r', '取得 %s 的 %s 裝置的屬性 %s 的值', 'getMetricValue', '提供者', '裝置名稱', '量測數值名稱'],
            [' ', '設定 %s 的 %s 裝置的屬性 %s 的值為 %s', 'setMetricValue', '提供者', '裝置名稱', '量測數值名稱', '值'],
            [' ', '中斷連線','disconnect'],
        ] 
    };

    // Register the extension
    ScratchExtensions.register('MQTT Extension', descriptor, ext);
    loadMQTT();
    
    
    // Face tracker variables
    var faceTrackX=0;
    var faceTrackY=0;

    var client = null;
    function connectMQTT() {
        // MQTT connection details
        //var client  = mqtt.connect("ws://192.168.2.117:11883/", "myclientid_" + parseInt(Math.random() * 100, 10));
        client = new Paho.MQTT.Client("ws://192.168.2.109:11883/", "myclientid_" + parseInt(Math.random() * 100, 10));
        var mqqtDefaultTopic="scratch/sisomm";

        client.onConnectionLost = function (responseObject) {
            console.log("connection lost: " + responseObject.errorMessage);
            setTimeout(client.connect(),100);
        };

        client.onMessageArrived = function (message) {
            console.log(message.destinationName, ' -- ', message.payloadString);
            var parts = message.payloadString.split(",");
            faceTrackX = parseInt(parts[0]);
            faceTrackY = parseInt(parts[1]);
        };

        var options = {
          timeout: 3,
          onSuccess: function () {
            console.log("mqtt connected");
            // Connection succeeded; subscribe to our topic, you can add multile lines of these
            client.subscribe("raspberry/1/face/1", {qos: 0});

            //use the below if you want to publish to a topic on connect
            message = new Paho.MQTT.Message('Hello');
            message.destinationName = "scratch/sisomm";
            client.send(message);

          },
          onFailure: function (message) {
            console.log("Connection failed: " + message.errorMessage);
          }
        };

        client.connect(options);
    
    }
})({});