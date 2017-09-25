/* Author : Doris Liao
 * Date : 2017-09-25
 * PubSubClient => https://github.com/knolleary/pubsubclient
 */
#include "DHT.h"
#include <SPI.h>
#include <YunClient.h>
#include <PubSubClient.h>

String USERNAME = "";
String TOKEN = "";
const char* server = "x.x.x.x"; // MQTT Server IP address
unsigned long lastSend;

/* Yun configuration */
byte mac[] = { x, x, x, x, x, x };
YunClient yun;

/* Define sensor / actuator pin and library [Start] */
#define DHT11_PIN 1
#define HCSR04_PIN 2
#define LEDWHITE_PIN 3
#define LEDRED_PIN 4
/* Define sensor / actuator pin and library [End] */

/* MQTT topic for sensor / actuator [Start] */
#define DHT11_TEMP_TOPIC "xxxxx/dht11/temp"
#define DHT11_HUMIDITY_TOPIC "xxxxx/dht11/humidity"
#define HCSR04_DISTANCE_TOPIC "xxxxx/hcsr04/distance"
#define LEDWHITE_LEDONOFF_TOPIC "xxxxx/ledwhite/ledonoff"
#define LEDRED_LEDONOFF_TOPIC "xxxxx/ledred/ledonoff"
/* MQTT topic for sensor [End] */

/* defines and variable for sensor/control mode [Start]
 *
 *
 * defines and variable for sensor/control mode [End] */

PubSubClient client(yun);

/* Initialize sensor/control object [Start]
 *
 *
 * Initialize sensor/control object [End] */

void setup() {
  // initialize serial for debugging
  Serial.begin(9600);
  // random seed, read from analog A0 (0~1023)
  randomSeed(analogRead(A0));
  delay(500);
  
  /* initialize sensor and actuator [Start] 
  *
  *
  * initialize sensor and actuator [End] */

  Serial.println("Start initialization of Yun...");
  Bridge.begin();
  Serial.println("Bridge finished setup");
  Serial.println("Starting connection to Network...");

  //connect to MQTT server
  client.setServer(server, xxxx);
  client.setCallback(callback);
  lastSend = 0;
}

//print any message received for subscribed topic
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  
  String topicString = String(topic); // topic
  /* Process received topic / message and set sensor/control mode [Start] 
   *
   *
   * Process received topic / message and set sensor/control mode [End] */
}

void loop() {
  reconnect();
  
  // put your main code here, to run repeatedly:
  unsigned long currentMillis = millis();
  if ( currentMillis - lastSend >= 1000 ) { // Update and send only after 1 seconds
    lastSend = currentMillis;
    getAndSendSensorData();
  }
  
  /* Set actuator status according to sensor/control mode [Start] 
   *
   *
   * Set actuator status according to sensor/control mode [End] */
}

/* Note : DO NOT Edit this function's whole content! */
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    /* Set MQTT client LAST WILL (TESTAMENT) [Start] */
    const char* willTopic = "online/xxxxx/down";
    const char* onlineTopic = "online/xxxxx/up";
    uint8_t willQoS = 0;
    boolean willRetain = false;
    const char* willMessage = "[{\"device\":\"dht11\"},{\"device\":\"hcsr04\"},{\"device\":\"ledwhite\"},{\"device\":\"ledred\"}]";
    /* Set MQTT client LAST WILL (TESTAMENT) [End] */
    
    // Attempt to connect, just a name to identify the client
    if (client.connect("AYun" + random(1000), USERNAME, TOKEN, willTopic, willQoS, willRetain, willMessage)) {
      Serial.println("connected");
      
      /* Once connected, publish an online notification */
      client.publish(onlineTopic, willMessage);
      
      /* Subscribe actuator topics [Start] */
      client.subscribe(LEDWHITE_LEDONOFF_TOPIC);
      client.subscribe(LEDRED_LEDONOFF_TOPIC);
      /* Subscribe actuator topics [End] */     
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
  client.loop();
}

void getAndSendSensorData()
{
  /* Reading sensor data [Start] 
   *
   *
   * Reading sensor data [End] */

  // Prepare a JSON payload string
  String payload = "";
  
  // Send payload
  char attributes[100];
  payload.toCharArray( attributes, 100 );
  
  /* Publish sensor data to sensor topics [Start] */
  client.publish(DHT11_TEMP_TOPIC, attributes);
  client.publish(DHT11_HUMIDITY_TOPIC, attributes);
  client.publish(HCSR04_DISTANCE_TOPIC, attributes);
  /* Publish sensor data to sensor topics [End] */   
}
