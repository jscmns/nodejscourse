const http = require('http');
const express = require('express');
const app = express();

app.use('/users', (request, response, next) => {
  console.log('Users list');
});

app.use((request, response, next) => {
  console.log('In root route')
  response.send("We are in root route");
});

app.listen(3000);