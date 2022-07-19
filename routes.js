const fs = require('fs');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  res.setHeader('Content-Type', 'text/html');

  if (url === '/') {
    res.write(` 
      <body>
        <h1>Welcome to fake website</h1>
        <form method="POST" action="/create-user">
          <input type="text" name="username" />
          <button type="submit">Add user</button>
        </form>
      </body>
    `);
    return res.end();
  }

  if (url === '/users') {
    res.write(` 
      <body>
        <h1>Fake user list</h1>
        <ul>
          <li>User 1</li>
          <li>User 2</li>
          <li>User 3</li>
          <li>User 4</li>
          <li>User 5</li>
          <li>User 6</li>
        </ul>
      </body>
    `);
    return res.end();
  }

  if (url === '/create-user' && method === 'POST') {
    const body = [];
    // req methods are asynchronous
    req.on('data', chunk => {
      body.push(chunk);
    });
    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const user = parsedBody.split('=')[1];
      console.log(user);
      res.statusCode = 302;
      res.setHeader('Location', '/');
      return res.end();
    });
  }
};

module.exports = requestHandler;
