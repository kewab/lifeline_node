var socket = io(); //connection to socket on server that hosts this page.


//when user presses start game button, hide the image, hide the button and 
//call socket api for default node.
$('#start-game').click(function() {
    try {
        window.control.getIMEI();
        $('#start-game').fadeOut("slow"); //hides the button

        $('#img-container').fadeOut("slow", function() { //hides the image and calls socket api

        $('#message-container').show();
          socket.emit('nextNode', {
            nodeId: 1
          });
        });
    } catch (e) {
        alert("不支持的设备");
    }
});



function addButtonChoices(btnChoice) {

  var div = $('<div class=\"btnChoices\"/>', {
      'data-role': 'fieldcontain'
    }),

    //Button definition for button to be added based on game flow.
    btn = $('<input/>', {
      type: 'button',
      value: btnChoice.btnText,
      id: btnChoice.nextNodeId,
      on: {
        click: function() {
          console.log('Next node ' + this.id);
          $('#messages').empty();
          $('#btnChoices').empty();
          socket.emit('nextNode', {
            nodeId: this.id
          });
        }
      }
    });

  btn.addClass('btn btn-default').appendTo(div);
  $('#messages:last-child').append(div);
}


//Messages are received via Socket and displayed
socket.on('msg', function(data) {

  console.log(data);

  var msgTextElem;

  //messages beginning with [ are considered to be displayed in green font.
  if (data.message.indexOf("[") != -1) {
    msgTextElem = $('<div class=\"message-text\"><p class=\"messageFiller\">' + data.message + '</p></div>');
  } else {
    msgTextElem = $('<div class=\"message-text\"><p>' + data.message + '</p></div>');
  }

  $('#messages').append(msgTextElem);

});

//EOM message type indicates that option buttons need to be displayed.
socket.on('eom', function(data) {
  console.log(data);
  data.buttonChoices.forEach(btnChoice => addButtonChoices(btnChoice));

 $(".btnChoices").get(0).scrollIntoView();

});

// 清空屏幕
socket.on('clearScreen', function(data) {
    console.log('clearScreen ' + data.id);
    $('#messages').empty();
    $('#btnChoices').empty();
    socket.emit('nextNode', {
      nodeId: data.id
    });
});

// 读取游戏记录
socket.on('readLoad', function(data) {
    console.log('readLoad ' + data.id);
    $('#start-game').fadeOut("slow"); //hides the button

    $('#img-container').fadeOut("slow", function() { //hides the image and calls socket api

    $('#message-container').show();
    $('#messages').empty();
    $('#btnChoices').empty();
    socket.emit('nextNode', {
      nodeId: data.id
    });

  });
});

function getParam(paramName) { 
    paramValue = "", isFound = !1; 
    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) { 
        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0; 
        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++ 
    } 
    return paramValue == "" && (paramValue = null), paramValue 
} 

// 获取unid参数
socket.on('getUnid', function(callback) {
    callback(window.control.getIMEI());
    // callback("123124123123123");
});

// 选择道具
function addButtonChoicesProps( data ) {

  var div = $('<div class=\"btnChoices\"/>', {
      'data-role': 'fieldcontain'
    }),

    //Button definition for button to be added based on game flow.
    btn = $('<input/>', {
      type: 'button',
      value: data.text + "(" + data.num + ")",
      id: data.id,
      on: {
        click: function() {
          console.log('Next node Props' + data.id);
          $('#messages').empty();
          $('#btnChoices').empty();
          socket.emit('nextNodeProps', data);
          // if(data.type == "revive") {
          //   socket.emit('nextNodeProps', data);
          // }else{
          //   socket.emit('nextNode', {
          //     nodeId: data.id
          //   });
          // }

        }
      }
    });

  btn.addClass('btn btn-default').appendTo(div);
  $('#messages:last-child').append(div);
}

socket.on('emitProps', function( data ) {
  console.log(data.id);
  // data.buttonChoices.forEach(btnChoice => addButtonChoices(btnChoice));
  console.log(data);
  addButtonChoicesProps(data);
 $(".btnChoices").get(0).scrollIntoView();
});