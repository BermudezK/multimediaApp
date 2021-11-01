
var express = require('express'); //NOTE: crearemos una aplicacion con la libreria express

var fs = require('fs'); //NOTE: modulo de administracion de archivos, implementa la programacion asincrona para procesar su creacion, lectura, modificacion, borrado


var path = require('path');//NOTE: nos permitira obtener la direccion del espacio de trabajo

var app = express();//NOTE: creamos la aplicacion express
var server = require('http').createServer(app);//NOTE: creamos el servidor

var io =  require('socket.io').listen(server);//NOTE:creamos el socket que contendra el servidor creado
var port = process.env.PORT || 3000;
var publicDir = `${__dirname}/public`;


var assert = [
  {id:0,   name:'Ed Sheeran - Shape of You [Official Video].mp4'},
  {id:1,   name:'IT (Eso) - Trailer 1 - Oficial Warner Bros.mp4'}
];

app.use(express.static(path.join(publicDir))); //NOTE: obtendremos la parte publica de nuestra aplicacion

app.get('/',function(req,res,next){
  res.sendFile(path.join(__dirname +'/index.html'));
});

app.get('/videos',function(req,res,next){
  res.sendFile(`${publicDir}/videos.html`);
});
app.post('/streamC', function (req,res){
  //NOTE: aqui enviaremos el cliente de la reproduccion del streaming
  res.sendFile(`${publicDir}/Client.html`);
})
app.post('/streamS', function (req,res){
//NOTE: Aqui enviaremos el server de la reproduccion del streming
  res.sendFile(`${publicDir}/Server.html`);
}) ;
//NOTE: cuando el servidor reciva /video muestra el contenido <- hay que cambiar
app.get('/video', function(req, res) {

  // console.log(req.query.id);
  id = req.query.id;
  console.log(req.query);
  var path = 'assets/'+ assert[id].name || 'assets/sample'
  var stat = fs.statSync(path)
  var fileSize = stat.size
  var range = req.headers.range

  if (range) {
    var parts = range.replace(/bytes=/, "").split("-")
    var start = parseInt(parts[0], 10)
    var end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    var chunksize = (end-start)+1
    var file = fs.createReadStream(path, {start, end})
    var head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    var head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }


});

io.on('connection', function(socket){

  socket.on('streaming',function(image){
    io.emit('playStream',image);
  })

});

server.listen(port, function () {
  console.log('Listening on port 3000!')
})
