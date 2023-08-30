
//----------------------------
const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');

// SERVER CONFIG
const app = express();
const port = 3000


// LOCAL HOST
const server = app.listen(port, () => {
   server.address().address
   server.address().port
});

// LOCAL HOST TO INTERNET
const localtunnel = exec(`lt --port ${port} --subdomain reconsys`);

//INFOS JSON INITIALIZE
let DATA_TO_SEND;
fs.readFile('serverData.json', 'utf8', (err, data) => {
   if (err) {
      console.error('Erro ao ler o arquivo JSON:', err);
      return;
   }
   try {
      DATA_TO_SEND = JSON.parse(data);
   } catch (error) {
      console.error('Erro ao fazer o parse do JSON:', error);
      return;
   }
});

app.use(express.static('view'));
app.use(express.json());

// SITE ROUTES SETUP (GET & POST)

// ROOT
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/view/index.html');
});

// ADD & DELETE INFOS
app.post('/data/add', (req, res) => {
   req.body.forEach(element => {
      DATA_TO_SEND.push(element);
   });
   const jsonContent = JSON.stringify(DATA_TO_SEND);

   fs.writeFile('serverData.json', jsonContent, 'utf8', (err) => {
      if (err) {
         console.error('Erro ao salvar o arquivo JSON:', err);
         return;
      }

      console.log('Novo objeto adicionado ao arquivo JSON com sucesso.');
   });
});

app.post('/data/del', (req, res) => {
   var dataToRemove = req.body;
   DATA_TO_SEND = DATA_TO_SEND.filter((json) => {
      let resposta = ((json['name'] != dataToRemove['name']) && (json['time'] != dataToRemove['time']) && (json['day'] != dataToRemove['day']))
      return resposta
   })
   const jsonContent = JSON.stringify(DATA_TO_SEND);
   fs.writeFile('serverData.json', jsonContent, 'utf8', (err) => {
      if (err) {
         console.error('Erro ao salvar o arquivo JSON:', err);
         return;
      }

      console.log('Novo objeto adicionado ao arquivo JSON com sucesso.');
   });
   res.send('removed')
});

//GET INFOS
app.get('/data', (req, res) => {
   res.json(DATA_TO_SEND);
});

// SERVER LOGS

localtunnel.stdout.on('data', data => {
   console.log('data: ' + data);
});

localtunnel.stderr.on('err', err => {
   console.log('erro: ' + err)
});

localtunnel.on('error', erro => {
   console.log('erro' + erro)
});

localtunnel.on('close', code => {
   console.log('codigo de execucao' + code)
});