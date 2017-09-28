<!--![ARDUINO YÚN](https://github.com/skellroyal/scratchx/blob/gh-pages/arduinoSampleCode/arduino_yun.jpg)
Source: https://store.arduino.cc/usa/arduino-yun*/-->

## 程式碼區塊與說明  

Arduino的範例程式碼區塊如下所示：  
```javascript
#include ...
(1) setup()
(2) loop()
(3) callback()
(4) reconnect()
(5) getAndSendSensorData()
```  
(1),(2)為Arduino內建函式，(3),(4),(5)為自定義函式，各函式功能說明如下：  

(1) 進入點 setup() 函式，做以下的動作  
    • 初始化元件之library、Serial通訊、全域變數  
    • 執行網路連線，判斷是否已連上網路  

(2) setup()執行完後會重複執行loop()函式，做以下動作  
    • 呼叫getAndSendSensorData()函式  
    • 判斷是否連線到MQTT broker  
    • 依照switch case的case值，設定元件的狀態(ex: 開led, 關led)  
    
(3) 當訂閱的主題有訊息送達時，callback()函式會被呼叫  
    • 印出接收到的主題與訊息內容  
    • 根據接收到的主題與訊息內容設定對應的switch case值  
    
(4) reconnect()函式：當loop()中判斷未連上MQTT broker時會呼叫reconnect()函式  
    • 嘗試連線到MQTT broker，若成功連上則先訂閱致動器主題再離開while loop  

(5) getAndSendSensorData()函式  
    • 使用元件之library讀取sensor值  
    • MQTT client 發送sensor值到對應之主題  

## Arduino範例程式碼修改說明  

供參考之範例程式碼：[arduino_yun.ino](https://github.com/skellroyal/scratchx/blob/gh-pages/arduinoSampleCode/sample_yun.ino)  

1. 程式碼的最前面需要 include 裝置所需的library  

2. 變數 ssid 填入欲連線無線網路之SSID名稱  
   變數 pass 填入欲連線無線網路之密碼  
   
3. /\* Define sensor / actuator pin and library [Start] \*/ 區塊  
   修改連接的裝置對應之PIN腳號碼  
   
4. /\* defines and variable for sensor/control mode [Start] \*/ 區塊  
   定義變數或switch case，例：  
   ```javascript  
   #define LEDW_OFF 0  // White LED off  
   #define LEDW_ON 1  // White LED on  
   #define LEDR_OFF 2  // Red LED off  
   #define LEDR_ON 3  // Red LED on  
   int ledCase = -1;  
   ```  

5. /\* Initialize sensor/control object [Start] \*/ 區塊  
   初始化裝置物件，例：DHT11溫濕度計\(搜尋關鍵字:"裝置的型號" "arduino"可找到程式語法\)  
   ```javascript
   DHT dht(DHTPIN, DHTTYPE);
   ```
   
6. /\* initialize sensor and actuator [Start] \*/ 區塊  
   初始化裝置，例：// DHT11溫濕度計(搜尋關鍵字:"裝置的型號" "arduino"可找到程式語法)  
   ```javascript
   dht.begin();
   ```
   
7. /\* Process received topic / message and set sensor/control mode [Start] \*/ 區塊  
   根據接收到的訊息topic和message內容設定對應的switch case，例：  
   我們分別定義了紅光LED和白光LED的主題，在接收到對應主題的訊息後，進一步查看訊息的內容為1或0。  
   若是白光LED主題且訊息內容為1，則會把ledCase設為LEDW_ON(其值為1)，當loop()函式內判斷switch case時，就會進入開啟白光LED的case，並由Arduino控制將白光LED打開。  
   ```javascript
   if (topicString.equals(LEDW_TOPIC) && (char)payload[0] == '0') {
       ledCase = LEDW_OFF;
   } else if (topicString.equals(LEDW_TOPIC) && (char)payload[0] == '1') {
       ledCase = LEDW_ON;
   } else if (topicString.equals(LEDR_TOPIC) && (char)payload[0] == '0') {
       ledCase = LEDR_OFF;
   } else if (topicString.equals(LEDR_TOPIC) && (char)payload[0] == '1') {
       ledCase = LEDR_ON;
   }
   ```

8. /\* Set actuator status according to sensor/control mode [Start] \*/ 區塊  
   根據switch case設定致動器，例：  
   假設ledCase被設成1，則會進入第2個case，由Arduino控制將白光LED打開。  
   ```javascript
   switch (ledCase) {
       case LEDW_OFF:
           // light should be off
           digitalWrite(LEDW_PIN, LOW);
           break;
       case LEDW_ON:
           // light should be on
           digitalWrite(LEDW_PIN, HIGH);
           break;
       case LEDR_OFF:
           // light should be off
           digitalWrite(LEDR_PIN, LOW);
           break;
       case LEDR_ON:
           // light should be on
           digitalWrite(LEDR_PIN, HIGH);
           break;
   }
   ```

9. /\* Reading sensor data [Start] \*/ 區塊  
   讀取感測器的數值，例：  
   ```javascript
   float t = dht.readTemperature();
   float h = dht.readHumidity();
   ```

10./\* Publish sensor data to sensor topics [Start] \*/ 區塊  
   發送感測器的值到對應的主題，例：  
   ```javascript
   client.publish(DHT11_TEMP_TOPIC, attributes);
   ```
