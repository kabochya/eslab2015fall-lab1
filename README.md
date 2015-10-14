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
前端一開始使用jQuery和Semantic UI框架做排版和互動，後來學習使用React.js重新寫過一遍，但因為時間關係就沒有去學怎麼幫元件加上CSS框架或做UI排版。  

因為之前寫過前端程式，這次一開始就花比較多時間在練習如何使用一個新的CSS框架。而重寫的部分，熟悉剛開始學的React花較多時間，不論是debug或是ES6和babel的種種問題，例如本來就不熟悉的React程式邏輯同時練習轉換至新的語法、ES6太新而線上文件比較少，以及常使用的chrome仍有一些支援度的問題等。  

我們使用了React作為動態更新畫面的基礎，用socket.io處裡即時性的的資料傳輸，其餘則使用AJAX和後端API溝通。一開始會進入登入畫面(，可以轉至註冊畫面再回來登入)，登入成功會自動跳轉至主頁面。頁面最上方會顯示你的帳號身分，已登入帳號的身分發文，也可以拍拍屁股登出走人。發文形式是輸入垃圾文字並搭配選擇一個醜陋貼圖(emoji)，成功送出後會顯示時間；使用者可以按鈕抨擊不爽的發文，按鈕會顯示有多少人搧了這篇文一巴掌，並會顯示其中一些人是誰，效果同Facebook的讚，當然也可以再按一次收回這個巴掌。  

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
- [x] Nickname Filter
- [x] Like(Slap)
- [x] 註冊系統


--

By 2015 NTUEE ES Lab G9 林秉民、胡明衛

