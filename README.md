# Talk Shit, Get Hit 
**ES Lab - Lab 1 Group 9**
##使用說明
```bash
	$ git clone https://github.com/kabochya/eslab2015fall-lab1.git
	$ npm install
	$ npm start
```
##作業說明
我們的Application叫Talk shit, get hit，不同於以往貼文按讚，我們走一個講屁話就該打的路線：將普通的推文App作業轉型成優質舒壓良品。  


###前端部分

###後端部分
後端我們並沒有使用助教提供的範例，而是採用Express.js的framework進行。採取Express的原因是因為他的模組較多，支援完善，且本次實驗所需要完成的功能不多，因此以API的形式進行相當方便。  

資料庫採用的是nedb，是一個語法類似mongodb，但是採用檔案系統做儲存的db套件。由於本次實驗資料不多，因此可以較不需要以效能為導向，而以快速開發做出成品為目的，因此採用nedb。  

認證部份，我們使用了passport.js套件，並利用express-session及connect-ensure-login實做session認證，選擇passport.js的原因是因為它相當完整並容易上手，所需進行的設定也較少，僅有因為我們需要認證ajax request，而需要改變passport的verification function。

###其餘部分
除了使用一般的HTTP request及AJAX進行前後端的溝通，我們這次也採用socket.io來進行即時性的資料broadcast，以達到貼廢文及賞巴掌時能夠即時呈現在所有使用者的頁面中。  

另外，貼文部分我們在後端的驗證上使用santize-html這個套件進行篩檢過濾，避免有惡意的貼文進行XSS攻擊。

## 作業目標
###基本
- [x] POST /post: 進行貼文
- [x] GET /posts: 取得現在所有的貼文
- [x] 後端 POST /post validation
- [x] 後端 persistent DB: nedb
- [x] 前端留言
- [x] 前端刷新（透過socket.io 自動更新)
- [x] 留言時間轉換
- [x] POST /post 留言內容 sanitization

### 加分
- [ ] Nickname Filter
- [x] Like(Slap)
- [x] 註冊系統


--

By 2015 NTUEE ES Lab G9 林秉民、胡明衛
