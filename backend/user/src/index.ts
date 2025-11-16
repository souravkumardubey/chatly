import express from 'express';

const app = express();

const port = 5000;

app.listen(port, () => {
  console.log(`User service is running at http://localhost:${port}`);
});