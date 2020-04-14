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

function googleSheetsapi(){
	bot.on('message', function(event) {
		//if (event.message.type === 'text') {
		var myId=event.source.userId;
		var msg = event.message.text;
		if (users[myId]==undefined){
			users[myId]=[];
			users[myId].userId=myId;
			users[myId].step=-1;
			users[myId].replies=[];
			}	
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
			if(myStep == 2) return false;
			}
		//}
	});
}


//LineBot收到user的文字訊息時的處理函式
bot.on('message', function(event) {
	if (event.message.text === '表單'){
		googleSheetsapi()
   
   }
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