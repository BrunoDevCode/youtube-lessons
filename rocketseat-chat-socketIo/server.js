const express = require('express')
const path = require('path')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'public'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.use('/', (req, res) => {
  res.render('index.html')
})

let messages = []

// Function executada quando um client se conecta
io.on('connection', socket => {
  console.log(`Socket conectado: ${socket.id}`)

  // Assim que o cliente entra no servidor é disparado este evento.
  socket.emit('previousMessages', messages)

  // O mesmo nome do event do frontend deve ser o recebido pelo backend
  socket.on('sendMessage', data => {
    messages.push(data)
    socket.broadcast.emit('receiveMessage', data)
  })
})

server.listen(3000)
