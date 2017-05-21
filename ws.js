(function(ext) {
    
    function loadMQTT() {
        $.getScript('http://' + url + ':8080/SEIoT/js/mqttws31.js')
        .done(function(script, textStatus) {
            console.log('Loaded MQTT');
            initMQTT();
        })
        .fail(function(jqxhr, settings, exception) {
            console.log('Error loading MQTT');
        });
    }
    
    /* 取得使用者的所有致動器存取權限列表 */
    function getActuatorList(username, callback) {
    	var values = {};
    	values['action'] = 'check.user.get.actuator.list';
    	values['username'] = username; //ScratchX的使用者名稱
    	console.log(values);
    	$.ajax({
    		url:'http://' + url + ':8080/SEIoT/actuator',
    		type : 'post',
    		data : values,
    		success : function(data) {
    			var json = JSON.parse(data);
    			control = json;
    			console.log(control);
    			callback();
    		},
    		error : function(e) {
    			callback();
    		}
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

    var isPassAuth = false; //是否通過身分驗證
    var isConnected = false; //是否連線到MQTT Broker
    var regexpChar = /^([0-9a-zA-Z])+$/, regexpWild = /^([0-9a-zA-Z/#+])+$/;
    var url = "140.113.216.245";
    var broker_url = "140.113.216.246";
    
    /* 連線到系統驗證使用者身分 */
    ext.connectToServer = function(username, callback){
    	/* verify input */
    	if(regexpChar.test(username) == false) {
    	    console.log('Your string contains illegal characters.');
    	    callback();
    	}
    	/* 呼叫ajax驗證使用者名稱 */
    	var values = {};
    	values['username'] = username;
    	console.log(username);
    	$.ajax({
    		url:'http://' + url + ':8080/SEIoT/auth_user',
    		type : 'post',
    		data : values,
    		success : function(data) {
    			var json = JSON.parse(data);
    			if (json[0]["isPassAuth"] == "1") { //通過身分驗證
    				isPassAuth = true;
    				getActuatorList(username, function(){
    					if (!client.isConnected()) {
        					reconnectMQTT(function(){
        						callback();
    	    				});
        				} else
        					callback();
    				});
    			} else { //未通過身分驗證
    				isPassAuth = false;
    				control = {};
    				callback();
    			}
    		},
    		error : function(e) {
    			callback();
    		}
    	});
    }
    
    /* 是否成功連線 */
    ext.connectSuccess = function(){
    	console.log("身分驗證:" + isPassAuth + ", 連到MQTT:" + isConnected + ", client.isConnected() -->" + client.isConnected());
    	if (isPassAuth && isConnected)
    		return 1;
    	else
    		return 0;
    }
    
    /* 訂閱主題 */
    ext.subscribeTopic = function(topic){
    	if (isPassAuth == false)
    		return;
    	/* verify input */
    	if(regexpWild.test(topic) == false) {
    	    console.log('Your string contains illegal characters.');
    	    return;
    	}
    	client.subscribe(topic, {qos: 0});
    	console.log('subscribe:' + topic);
    }
    
    /* 取消訂閱主題 */
    ext.unsubscribeTopic = function(topic){
    	if (isPassAuth == false)
    		return;
    	/* verify input */
    	if(regexpWild.test(topic) == false) {
    	    console.log('Your string contains illegal characters.');
    	    return;
    	}
    	client.unsubscribe(topic);
    	console.log('unsubscribe:' + topic);
    }

  
    /* 檢查使用者是否取得actuator使用權 */
    var control = {};
    ext.checkUserGetActuator = function(provider, device, metric){
    	if (isPassAuth == false)
    		return;
    	/* verify input */
    	if(regexpChar.test(provider) == false || regexpChar.test(device) == false || regexpChar.test(metric) == false) {
    	    console.log('Your string contains illegal characters.');
    	    return;
    	}
    	if (provider in control == false)
    		return;
    	if (device in control[provider] == false)
    		return;
    	if (metric in control[provider][device] == false)
    		return;
    	return 1;
    }
    
    /* 取得sensor值 */
    ext.getMetricValue = function(provider, device, metric){
    	if (isPassAuth == false)
    		return;
    	/* verify input */
    	if(regexpChar.test(provider) == false || regexpChar.test(device) == false || regexpChar.test(metric) == false) {
    	    console.log('Your string contains illegal characters.');
    	    return;
    	}
    	/* 從obj物件取值 */
    	if (obj[provider][device][metric] == false)
    		return;
    	return obj[provider][device][metric];
    }
    
    
    /* 設定actuator值 */
    ext.setMetricValue = function(provider, device, metric, value){
    	if (isPassAuth == false)
    		return;
    	/* verify input */
    	if(regexpChar.test(provider) == false || regexpChar.test(device) == false || regexpChar.test(metric) == false) {
    	    console.log('Your string contains illegal characters.');
    	    return;
    	}
    	/* 增加判端是否取得致動器控制權限, 從control物件取值 */
    	if (provider in control == false)
    		return;
    	if (device in control[provider] == false)
    		return;
    	if (metric in control[provider][device] == false)
    		return;	
    	
    	console.log(value);
        message = new Paho.MQTT.Message(value.toString());
        message.destinationName = provider + "/" + device + "/" + metric;
        client.send(message);
    }

    /* 中斷連線 */
    /*ext.disconnect = function(){
    	if (isPassAuth == false)
    		return;
    	isPassAuth = false;
        if (client.isConnected()) {
        	client.disconnect();
        	console.log("mqtt disconnected");
        }
    }*/
    
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['w', '我是 %s 連線到系統', 'connectToServer', '使用者名稱'],
            ['r', '成功連線', 'connectSuccess'],
            [' ', '訂閱主題 %s', 'subscribeTopic', '主題'],
            [' ', '取消訂閱主題 %s', 'unsubscribeTopic', '主題'],
            ['r', '是否取得 %s 的 %s 裝置的屬性 %s', 'checkUserGetActuator', '提供者', '裝置名稱', '量測數值名稱'],
            ['r', '取得 %s 的 %s 裝置的屬性 %s 的值', 'getMetricValue', '提供者', '裝置名稱', '量測數值名稱'],
            [' ', '設定 %s 的 %s 裝置的屬性 %s 的值為 %s', 'setMetricValue', '提供者', '裝置名稱', '量測數值名稱', '值'],
            /*[' ', '中斷連線', 'disconnect'],*/
        ] 
    };

    // Register the extension
    ScratchExtensions.register('MQTT Extension', descriptor, ext);
    loadMQTT();
    
    
    // Sensor value variables
    var obj = {};
    
    var client;
    var options = {
        timeout: 3,
        onSuccess: function () {
        	isConnected = true;
        	console.log("mqtt connected");
        },
        onFailure: function (message) {
        	isConnected = false;
        	console.log("Connection failed: " + message.errorMessage);
        }
    };
    /* Init MQTT */
    function initMQTT() {
    	try {
	    	// MQTT connection details
	        client = new Paho.MQTT.Client("ws://" + broker_url + ":11883/", "myclientid_" + parseInt(Math.random() * 100, 10));
	        //var mqqtDefaultTopic="scratch/sisomm";
	
	        client.onConnectionLost = function (responseObject) {
	        	isConnected = false;
	            console.log("connection lost: " + responseObject.errorMessage);
	            setTimeout(client.connect(), 100);
	        };
	
	        client.onMessageArrived = function (message) {
	            console.log(message.destinationName, ' -- ', message.payloadString);
	            var parts = message.destinationName.split("/");
	            if (parts.length != 3) //判斷是否符合正確的topic格式, ex: provider/device/metric
	            	return;
	            var provider = parts[0];
	            var device = parts[1];
	            var metric = parts[2];
	            var data = message.payloadString;
	            
	            console.log(provider + ', ' + device + ', ' + metric);
	            
	            if (provider in obj == false)
	            	obj[provider] = {}; //init sub-object
	
	            if (device in obj[provider] == false)
	            	obj[provider][device] = {}; //init sub-object
	            	
	            obj[provider][device][metric] = data;
	            console.log(obj);
	        };
        	client.connect(options);
    	} catch (e) {
    		console.log(e);
    	}
    }
    
    /* 重新連線到MQTT Broker */
    function reconnectMQTT(callback){
    	client.connect(options);
    	window.setTimeout(function() {
    		console.log("reconnect!");
            callback();
        }, 1000);
    }
})({});
