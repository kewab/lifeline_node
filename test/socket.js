var http = require('http');
var fs = require('fs');
var db = require('./db');
var express = require('express');
var app = express();
var url = require('url');
function onRequest(req, res) {
  console.log(__dirname + '/../public/index.html');
  fs.readFile(__dirname + '/../public/index.html', function(err, data) {
    if (err) {
      res.writeHead(500);
       return res.end('error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  })
}

var app = http.createServer(onRequest);
var io = require('socket.io')(app);
io.on('connection', function(socket) {
  socket.emit('news', 'Hello world');
  socket.on('my other event', function(data) {
    console.log(data);
  })
})

// var unid = "9897812124";
// var sql = 'select * from game_load where unid = ' + db.escape(unid);  
// db.query(sql, function(err, rows, fields){
//     try{
//       // 读取记录
//         if(rows.length > 0) {
//             // console.log(2);
//         }else{
//           // 新增记录
//           var addsql = 'INSERT INTO game_load(unid,now_node_id,now_delay_seconds,addtime) VALUES(?,?,?,?)';
//           var addsqlparams = [unid, '1', '68', Math.round(new Date().getTime()/1000).toString()]; 
//           db.query(addsql,addsqlparams,function (err, result) {
//               if(err){
//                   console.log('error');
//                   return;
//               }
//               console.log('-----------------新增成功----------------');
//               console.log(result);
//               console.log('-----------------结束----------------');
//           })
//         }
        
//     }catch(err){
//       console.log("没有此条数据 " + unid);
//     }  
// });
      // app.get('/', function(req, res) {
      //   console.log(req.query.unid);
      // });
//       testUrl = document.location;
// console.log(URL.parse(testUrl));
function aa() {
    console.log(1221312);
}

  http.listen( 3000, function(){
    console.log('App started ...');
  });
  

 // http.createServer(function(req, res){
 //    var arg = url.parse(req.url,true).query;  
 //    console.log(arg.unid);//返回001
 //    //然后就可以根据所得到的数据处理了    
 // }).listen(8888);//建立服务器并监听端口