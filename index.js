var app = require('express')();
var fs=require('fs');
var http = require('http').Server(app);

var io = require('socket.io')(http);
var ar={};
var num=0;

var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(1920,1080)
  , ctx = canvas.getContext('2d');
var chathist={};
var chatindex=0;
app.get('/', function(req, res){
  res.sendfile('index.html');
});
app.get('/img.html', function(req, res){
  res.sendfile('img.html');
});
io.on('connection', function(socket){

console.log(num);
for(var i=0;i<num;i++){

socket.emit('chat message',chathist[i]);
}
socket.emit('erase');    

    socket.on('draw', function(arr){
        prevX=arr[0];
    prevY=arr[1];
    currX=arr[2];
    currY=arr[3];
    x=arr[5];
    y=arr[6];
    if(arr[4]==0){
    draw();
    }
    if(arr[4]==1){
        ctx.beginPath();
        ctx.fillStyle = x;
        ctx.fillRect(currX, currY, 2, 2);
    ctx.closePath();
    }

    io.emit('draw', arr);
  
});
socket.emit('init',canvas.toDataURL());
  socket.on('erase', function(){
ctx.clearRect(0,0,canvas.width,canvas.height);      
io.emit('erase' );
      
  });
socket.on('load',function(string){
loadImage(string);

});
socket.on('log', function(msg){
      console.log(msg);

  });
socket.on('chat message', function(msg){
io.emit('chat message', msg);
chathist[num]=msg;
num++;
});
});

http.listen(3000, function(){
  console.log('listening on *:3000\n');
  });


function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);

    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
};

diss();

function diss(){
 
var prompt = require('prompt');


  prompt.start();

  prompt.get([{description:'Enter Command',name:'command'}], function (err, result) {
    if (err) { process.exit(0); }
    var cmd=result.command.split(' ');
    if(cmd[0]=='save'){
        saveImage(cmd[1]);
        console.log('Saved to ./Images/'+cmd[1]+'.png');
    }
    if(cmd[0]=='load'){
    loadImage(cmd[1]);
    }
    if(cmd[0]=='list'){
    var files=fs.readdirSync('./Images');
    console.log(files);
    }
    if(cmd[0]=='exit'){
    process.exit(0);
    }
    if(cmd[0]=='clear'){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    io.emit('erase');
    }
    diss();
  });
};

function loadImage(string){
fs.readFile('./Images/'+string, function(err, squid){
    if (err) throw err;
    img = new Image;
    img.onload=function(){
    ctx.clearRect(0,0,800,800);
    ctx.drawImage(img, 0, 0, 800,800);
    io.emit('erase');
    io.emit('init',canvas.toDataURL());

    }
    img.src = squid;
    });


}
function saveImage(string){
var write=fs.createWriteStream('./Images/'+string+'.png'),
        stream=canvas.pngStream();
        stream.on('data',function(chunk){
            write.write(chunk);
        });


}
