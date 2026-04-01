// Importing env variables
import 'dotenv/config';

// Importing configs
import express, { Express } from 'express';
import cors from 'cors';

// Importing Configs
import mongooseConnect from './configs/mongoose.config';

const port = process.env.PORT;
const app: Express = express();

mongooseConnect();

app.use(
  cors({
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true
  })
);

app.get('/', (req, res) => {
  res.send('Server is Running Successfully');
});

app.listen(port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${port} - ${new Date().toDateString()} / ${new Date().toLocaleTimeString()}`
  );
});
