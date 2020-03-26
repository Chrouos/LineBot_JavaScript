var linebot = require('linebot');
var express = require('express');

var bot = linebot({
  channelId: '1653997557',
  channelSecret: '434163c0cf2c8794379b69a4c1ab81ac',
  channelAccessToken: 'wlSJbG2kBLNUtpUs/0TOlznH+m6Y7BicIkqXuOCddHH8d9nKFqChrPTjSXcG+px5zliuyzT3RhXdq+sucR9UH0DLMX3BDnT19GoRlOMK+70Kut+MdRkET9uoFGvMY6ARLYhkvIkmoYHi+JsRU8Ma1AdB04t89/1O/w1cDnyilFU=/C2I61IXK6cJuSjQJGYKCa8T58buxFfPtWrOKoS+iGKO3NX7W9MQBNzLXHWPH/Jb0rTpRZbhxb992mWujAmmD/ogbsuncQctAgdB04t89/1O/w1cDnyilFU='
});

//這一段的程式是專門處理當有人傳送文字訊息給LineBot時，我們的處理回應
bot.on('message', function(event) {
  if (event.message.type = 'text') {
    var msg = event.message.text;
  //收到文字訊息時，直接把收到的訊息傳回去
    event.reply(msg).then(function(data) {
      // 傳送訊息成功時，可在此寫程式碼 
      console.log(msg);
    }).catch(function(error) {
      // 傳送訊息失敗時，可在此寫程式碼 
      console.log('錯誤產生，錯誤碼：'+error);
    });
  }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('目前的port是', port);
});