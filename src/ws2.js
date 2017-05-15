(function(ext) {

    function loadMQTT() {
    $.getScript('http://sisomm.github.io/scratch-skull-extension/mqttws31.js')
          .done(function(script, textStatus) {
            console.log('Loaded MQTT');
          })
          .fail(function(jqxhr, settings, exception) {
            console.log('Error loading MQTT');
        });
    }
    //var mqtt = require('mqtt');
    //var $ = require('jquery');
    
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

    ext.faceX = function(){
        return faceTrackX;
    }

    ext.faceY = function(){
        return faceTrackY;
    }

    ext.isConnected = function(){
        if(client.isConnected()){
            return 1;
        } else {
            return 0;
        }
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['r', 'Faxe X','faceX'],
            ['r', 'Face Y','faceY'],
            ['r', 'Connected','isConnected'],
        ] 
    };

    // Register the extension
    ScratchExtensions.register('Face Tracker', descriptor, ext);
    loadMQTT();
    

    // Face tracker variables
    var faceTrackX=0;
    var faceTrackY=0;

    // MQTT connection details
    //var client  = mqtt.connect("ws://192.168.2.117:11883/", "myclientid_" + parseInt(Math.random() * 100, 10));
    var client = new Paho.MQTT.Client("ws://192.168.2.117:11883/", "myclientid_" + parseInt(Math.random() * 100, 10));
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
        client.publish("scratch/sisomm", "Hello");
  
      },
      onFailure: function (message) {
        console.log("Connection failed: " + message.errorMessage);
      }
    };
      

    client.connect(options);



})({});
