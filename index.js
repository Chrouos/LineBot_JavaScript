//以下的四列require裡的內容，請確認是否已經用npm裝進node.js
const  linebot = require('linebot');
const  express = require('express');
const  google = require('googleapis');
const  googleAuth = require('google-auth-library');
//const {GoogleAuth, JWT, OAuth2Client} = require('google-auth-library');

//以下的引號內請輸入申請LineBot取得的各項資料，逗號及引號都不能刪掉
var bot = linebot({
  channelId: '1653997557',
  channelSecret: '434163c0cf2c8794379b69a4c1ab81ac',
  channelAccessToken: 'wlSJbG2kBLNUtpUs/0TOlznH+m6Y7BicIkqXuOCddHH8d9nKFqChrPTjSXcG+px5zliuyzT3RhXdq+sucR9UH0DLMX3BDnT19GoRlOMK+70Kut+MdRkET9uoFGvMY6ARLYhkvIkmoYHi+JsRU8Ma1AdB04t89/1O/w1cDnyilFU='
});

//底下輸入client_secret.json檔案的內容
var myClientSecret={"installed":{"client_id":"334174209716-a5ediaon0qttg2aumrlrbrsffhatatsi.apps.googleusercontent.com","project_id":"phrasal-ability-272210","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"5H_pcFoR1nuiZ5jmQyUgcpIQ","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(myClientSecret.installed.client_id,myClientSecret.installed.client_secret, myClientSecret.installed.redirect_uris[0]);

//底下輸入sheetsapi.json檔案的內容
oauth2Client.credentials ={"access_token":"ya29.a0Adw1xeWH5i7fs7-Y2a25CIJN4hxQSwNptwM4hVOaTawj2VoPtoFtLVtKs5sQm1vKbtszN06u-w6xA4VwaCFVBHbCQF7fvCqtq_akjGTG0xMzbq_MIr1eXJKAzsPugYcX_qDBLsq8RZguqK4SvdKsTZADrJX70GVn9Z0","refresh_token":"1//0e22ft5U-OfeJCgYIARAAGA4SNwF-L9IrLmDM6kfSyvHOEzlco8wK_hdF1htGck9v0GitHiEuQasnPh-UPtX7DNAPTT5ntujRkCM","scope":"https://www.googleapis.com/auth/spreadsheets","token_type":"Bearer","expiry_date":1585256334619}

//試算表的ID，引號不能刪掉
var mySheetId='1q1kHjTjEhLKR73QiMHMnZ7G8B8FLwDXHHBWznpbYX3E';

var myQuestions=[];
var users=[];
var totalSteps=0;
var myReplies=[];

//程式啟動後會去讀取試算表內的問題
getQuestions();


//這是讀取問題的函式
function getQuestions() {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
     auth: oauth2Client,
     spreadsheetId: mySheetId,
     range:encodeURI('問題'),
  }, function(err, response) {
     if (err) {
        console.log('讀取問題檔的API產生問題：' + err);
        return;
     }
     var rows = response.values;
     if (rows.length == 0) {
        console.log('No data found.');
     } else {
       myQuestions=rows;
       totalSteps=myQuestions[0].length;
       console.log('要問的問題已下載完畢！');
     }
  });
}

//這是將取得的資料儲存進試算表的函式
function appendMyRow(userId) {
   var request = {
      auth: oauth2Client,
      spreadsheetId: mySheetId,
      range:encodeURI('表單回應 1'),
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'RAW',
      resource: {
        "values": [
          users[userId].replies
        ]
      }
   };
   var sheets = google.sheets('v4');
   sheets.spreadsheets.values.append(request, function(err, response) {
      if (err) {
         console.log('The API returned an error: ' + err);
         return;
      }
   });
}

//表單回復Function
function googleSheetsapi(event){
		if (event.message.type === 'text') {
			var myId=event.source.userId;
			
			var myStep=users[myId].step;
			if (myStep===-1)
				sendMessage(event,myQuestions[0][0]);
			else{
				if (myStep==(totalSteps-1))
					sendMessage(event,myQuestions[1][myStep]);
				else
					sendMessage(event,myQuestions[1][myStep]+'\n'+myQuestions[0][myStep+1]);
				users[myId].replies[myStep+1]=event.message.text;
			}
			myStep++;
			users[myId].step=myStep;
			
			console.log(myStep);
						
			if (myStep>=totalSteps){
			myStep=-1;
			users[myId].step=myStep;
			users[myId].replies[0]=new Date();
			appendMyRow(myId);	
				}	
		}
}

//呼叫小工人
function welcome_start(event){
	var welcome ={
		type: 'template',
		altText: '小工人在這裡跟你說抱歉，電腦板顯示不出來இдஇ',
		//可放入圖片
		//thumbnailImageUrl: 'https://github.com/line/line-bot-sdk-nodejs/raw/master/examples/kitchensink/static/buttons/1040.jpg',
		template: {
			type: 'buttons',
			title: '請選擇你想要我做什麼～',		
			text: '點擊會嗎？',
			actions: [
			//	{ label: '想了解小工人', type: 'message', text: '想了解小工人' }, #最多四個
				{ label: '文化資工', type: 'message', text: '文化資工' },
				{ label: '招生網頁', type: 'message', text: '招生網頁'},
				{ label: '校園地圖', type: 'message', text: '校園地圖'},
				{ label: '呼叫表單', type: 'message', text: '表單' },
			],
		},
	}
	event.reply(welcome).then(function(data) {
		console.log('有人呼叫小工人出來了！');
	}).catch(function(error) {
		console.log('錯誤產生，錯誤碼：'+error);
	});
}	

//LineBot收到user的文字訊息時的處理函式
bot.on('message', function(event) {
	
	var myId=event.source.userId;
	console.log("ID = " + myId + " 正在使用中");
	if (users[myId]==undefined){
		users[myId]=[];
		users[myId].userId=myId;
		users[myId].step=-1;
		users[myId].replies=[];
	}	
	if( users[myId].step >= 0){
		googleSheetsapi(event)
	}
	if(event.message.text == '表單'){
		googleSheetsapi(event)
	}
	
	
	
	if(event.message.text == '文化資工'){
		var msg = '哈囉～' + "\n" + '這裡包含關於文化資工的信息，請點下面這個唷 d(`･∀･)b' + "\n\n" + 'https://university.1111.com.tw/univ_depinfo5.aspx?sno=100123&mno=520114' + "" + '\n當然，如果你有問題歡迎使用「表單」系統，呼叫文化資工具專人為你回答唷。(在校的學長姐們)';
	  //收到文字訊息時，直接把收到的訊息傳回去
		event.reply(msg).then(function(data) {
		  // 傳送訊息成功時，可在此寫程式碼 
		  console.log("文化資工的呼叫");
		}).catch(function(error) {
		  // 傳送訊息失敗時，可在此寫程式碼 
		  console.log('錯誤產生，錯誤碼：'+error);
		});
	}//文化資工
	
	if(event.message.text == '招生網頁'){
		var msg = '你呼叫招生網頁我聽到了！！\n由於我不太專業，只好請到了專業的學校網站出來(́◉◞౪◟◉‵) \n以下的內容有：課程大綱、師資陣容、系作介紹等等…'+ '\n\n' + 'https://iecs.pccu.edu.tw/files/11-1130-5770.php';
		event.reply(msg).then(function(data) {
		console.log("招生網頁的呼叫");
		}).catch(function(error) {
		console.log('錯誤產生，錯誤碼：'+error);
		});
	}//招生網頁
	
	if(event.message.text == '校園地圖'){
		var msg = '好心的機器人告訴大家，文化很小，也很好迷路～\n機器人友情提示：迷路的只有學長姐……\n\n所以特地準備了地圖，歡迎大家點進看看校園長什麼樣子～\n\n\n所以特地準備了地圖，歡迎大家點進看看校園\n\n https://www.pccu.edu.tw/intro_traffic.html \n\n也準備了校園平面圖呢！\n https://www.pccu.edu.tw/intro_campus_map.html';
		event.reply(msg).then(function(data) {
		console.log("校園地圖的呼叫");
		}).catch(function(error) {
		console.log('錯誤產生，錯誤碼：'+error);
		});
	}//校園地圖
	
	if(event.message.text == '想了解小工人'){
		var introduce = "我是文化資工人所創造的招生聊天機器人ε٩(๑> ₃ <)۶з \n我叫「文化資訊小工人」，很好(難)聽吧～\n這裡有關許多你不懂的也有許多我不懂的(?) \n不過歡迎隨時呼叫我唷，不然我會長灰塵的！ \n啊不過我沒有實體… \n\n那麼！可以這樣呼叫我：\n「文化資工」\n「招生網頁」\n「校園地圖」\n並且有任何不懂的問題可以呼叫我「表單」\n這樣一來在校的學長姐們就會為你們回答哦！ \n\n偷偷告訴你們，想我的時候或忘記的時候，喊「小工人」就好了哦♡(*´∀｀*)人(*´∀｀*)♡" ;
		event.reply(introduce).then(function(data) {
		console.log("想了解小工人");
		}).catch(function(error) {
		console.log('錯誤產生，錯誤碼：'+error);
		});
	}//想了解小工人
	
	if(event.message.text == '小工人'){
		welcome_start(event);
	}
	
	//小彩蛋
	if(event.message.text == '還想知道更多'){
		var msg = '還真的是很多要求呢？\n是不是很想了解我們學校呀？ლ(◉◞౪◟◉ )ლ\n\n那麼竟然你大發慈悲的問了，我就貫徹… 好啦好啦\n可以輸入下面來呼叫我\n';
		event.reply(msg).then(function(data) {
		console.log(msg);
		}).catch(function(error) {
		console.log('錯誤產生，錯誤碼：'+error);
		});
	}//moremore

	
});


//這是發送訊息給user的函式
function sendMessage(eve,msg){
   eve.reply(msg).then(function(data) {
      // success 
      return true;
   }).catch(function(error) {
      // error 
      return false;
   });
}


const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});