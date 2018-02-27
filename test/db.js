// var db    = {};  
var mysql = require('mysql');  
var pool  = mysql.createPool({  
  connectionLimit : 10,  
  host: 'rm-2zeph8t4c7q1w0g34o.mysql.rds.aliyuncs.com',//数据库地址
  user : "iwan",//数据库用户
  password: "zBgx6GdIW4dUsEMB",//数据库密码
  database : "h5_game_iwanhudong_cn"//需要连接的数据库
});  
  
// db.query = function(sql, callback){  
  
//     if (!sql) {  
//         callback();  
//         return;  
//     }  
//     pool.query(sql, function(err, rows, fields) {  
//       if (err) {  
//         console.log(err);  
//         callback(err, null);  
//         return;  
//       };  
  
//       callback(null, rows, fields);  
//     });  
// }  
module.exports = pool; 