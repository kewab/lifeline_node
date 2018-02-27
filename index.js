var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db');
var gameDataReader = require('./gamedatareader');
var gameEngine = require('./play');
var timeoutIds = [];

// 查询是否有记录
// var unid = window.control.getIMEI();
// var unid = 1265498971;
// var sql = 'select * from game_load where unid = ' + db.escape(unid);  
// db.query(sql, function(err, rows, fields){
//     try{
//       	// 读取记录
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
//       console.log("抱歉出错了~" + unid);
//     }  
// }); 
 


gameDataReader.readGameData(function(err, gameData){

	if(err) throw err;

	//sets up public folder to serve static assests including html, css and what not.
	app.use('/static', express.static(path.join(__dirname,'/public')));

	//after game data is loaded, fire up the server and get ready for action
	app.get('/', function( req,res ){
		res.sendFile(path.join(__dirname, '/public/index.html'));
	});

	io.on('connection', function(socket){
		//close socket on user disconnect. TODO:: Lots to do here. 
		socket.on('disconnect', function(){
    		console.log('User disconnected');
    		//clear timeouts
    		timeoutIds.forEach( function( id ){
    			console.log( ' Clearing Timeout ID '+ id);
    			clearInterval( id );
    		});
  		});

		gameEngine.start( gameData );

		
		function emitMessage(message){
			socket.emit('msg', {message : message});
		}

		function emitEndOfMessage( nodeId ){
			socket.emit('eom', { buttonChoices : gameEngine.fetchOptions( nodeId )});
		}

		// 游戏道具
		function emitProps( data ){
			socket.emit('emitProps', data);
		}

		function clearScreenNextNode( nodeId ){
			socket.emit('clearScreen', { id : nodeId});
		}

		function readGameLoad( nodeId ){
			socket.emit('readLoad', { id : nodeId});
		}		

		function execSql(sql, param, callback) {
				socket.emit('getUnid', function( unid ) {
				param.push(unid);
			      db.query(sql, param, function (err, result) {
			        try{
				          if(err){
				            console.log('error');
				            return;
				          }
				          callback(result);
			          }catch(err){
			              console.log("抱歉出错了~" + unid);
			          }  
			      });
				});

		}

		//Function to fetch messages and call socket.emit at specified intervals.
		//TODO: make the wait time variable. 
		function playNode( nodeId ){
			var i=0; messages = gameEngine.fetchMessagesForNode( nodeId ), l = messages.length;
			var delaySec = gameEngine.fetchSeconds( nodeId ) * 1000;
			var btnLen = gameEngine.fetchOptions( nodeId ).length;
			var nowTime = Math.round(new Date().getTime() / 1000).toString();
		    execSql("UPDATE game_load SET now_node_id = ?,now_delay_seconds = ?,updatetime = ? WHERE unid = ?",[nodeId, delaySec, nowTime], function( data ) {
	        	try{
			          if(err){
			            console.log('error');
			            return;
			          }
				      console.log("------------------update------------------");
		          }catch(err){
		              console.log("抱歉出错了~" + unid);
		          }  
		      });


			(function emitNodeMessages(){
				console.log( messages[i] );
				emitMessage( messages[i] );
				if( ++i < l){
					timeoutIds.push(setTimeout(emitNodeMessages, 1000));
				}else{
					if(btnLen > 0) {
						emitEndOfMessage( nodeId );
					}else{
						// console.log(nodeId);
						if( !gameEngine.fetchIsTerminalNode( nodeId ) ) {
							// 死掉了
							timeoutIds.push(setTimeout(function() {
								console.log("emitProps");
								execSql("select * from game_load where unid = ?",[],function( data ) {
									emitProps({"type":"revive","text":"复活卡", "id":nodeId, "num": data[0].revive_props});
									//{"type":"deceleration","text":"时间卡", "id":nodeId, "num": data[0].deceleration_props}
								});
								
							}, 1200));
						}else{
							if(delaySec > 10000) {
								emitMessage("[仙界繁忙请耐心等待。。。]（也可以选择使用时间卡道具来减少时间）");
								timeoutIds.push(setTimeout(function() {
								execSql("select * from game_load where unid = ?",[],function( data ) {
										emitProps({"type":"deceleration","text":"时间卡", "id":nodeId, "num": data[0].deceleration_props});
									});
									
								}, 1200));
							}
							timeoutIds.push(setTimeout(function() {
								clearScreenNextNode(parseInt(nodeId) + 1);
							}, delaySec));
						}

					}
				}
			})();
		
		}

		(function() {
			execSql("select * from game_load where unid = ?",[],function( data ) {
				console.log(data.length);
				try{
					if(data.length) {
						// var nowTime = Math.round(new Date().getTime() / 1000).toString();
						// var limitTime = (nowTime - data[0].updatetime) * 1000;
						// var remTime = data[0].now_delay_seconds - limitTime;
						// if( remTime > 0 ) {
						// 	timeoutIds.push(setTimeout(function() {
						// 		clearScreenNextNode(nodeId + 1);
						// 	}, remTime));
						// }else{
						// 	readGameLoad(data[0].now_node_id);
						// }
						//clearScreenNextNode(data[0].now_node_id);
						readGameLoad(data[0].now_node_id);
					}else{
			    	// 新增记录
			          	var addsql = 'INSERT INTO game_load(now_node_id,now_delay_seconds,updatetime,addtime,unid) VALUES(?,?,?,?,?)';
			          	var nowTime = Math.round(new Date().getTime() / 1000).toString();
			          	var addsqlparams = ['1', '68000', nowTime, nowTime]; 
			          	execSql(addsql, addsqlparams, function(d1) {
			              	if(err){
			                  	console.log('error');
			                  	return;
			              	}
			              	console.log('-----------------add----------------');
			          	});
					}
				}catch(err){
					console.log(err);
				}
			});

		})()


		socket.on('nextNode', function( req ){
			console.log( req.nodeId );
			playNode( req.nodeId );
		});

		// 复活卡
		socket.on('nextNodeProps', function( req ){
			console.log( req.id );
			execSql("select * from game_load where unid = ?",[],function( data ) {
				try{
					// 复活卡
					if(req.type == "revive") {
						// 查询剩余复活卡次数
						if( data[0].revive_props > 0 ) {
							playNode( gameEngine.fetchParentId(req.id) );
							// 减少复活次数
						    execSql("UPDATE game_load SET revive_props = ? WHERE unid = ?",[data[0].revive_props - 1], function( ret ) {
					        	try{
							          if(err){
							            console.log('error');
							            return;
							          }
								      console.log("------------------update_revive------------------");
						          }catch(err){
						              console.log("复活卡更新出错了~");
						          }  
						      });
						}else{
							emitMessage("每人有两次复活机会，您的复活次数已经用完!");
						}
					}else{
						// 时间卡
						// 查询剩余时间卡次数
						if( data[0].deceleration_props > 0 ) {
							playNode( parseInt(req.id)  + 1);
							// 减少复活次数
						    execSql("UPDATE game_load SET deceleration_props = ? WHERE unid = ?",[data[0].deceleration_props - 1], function( ret ) {
					        	try{
							          if(err){
							            console.log('error');
							            return;
							          }
								      console.log("------------------update_shijian------------------");
						          }catch(err){
						              console.log("时间卡更新出错了~");
						          }  
						      });
						}else{
							emitMessage("每人有两次使用时间卡的机会，您的次数已经用完!");
						}


					}

				}catch(err){
					console.log(err);
				}
			})
		});

		// 减少等待时间
		// socket.on('nextNodeProps', function( req ){
		// 	console.log( req.nodeId );
		// 	playNode( req.nodeId );
		// });
		
	});

	http.listen( 3065, function(){
		console.log('App started ...');
	});
})