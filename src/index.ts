// Importing env variables
import 'dotenv/config';

// Importing configs
import express, { Express } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// Importing Configs
import mongooseConnect from './configs/mongoose.config';
import socketConfig from './configs/socket.config';

//Importing Routs
import routes from './routes/index';

const port = process.env.PORT || 8080;
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const app: Express = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

mongooseConnect();
socketConfig(io);

app.use(
  cors({
    origin: [...corsOrigins, 'http://localhost:5173'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

server.listen(port, () => {
  console.log(
    `⚡️[server]: Server is running on port ${port} [${process.env.NODE_ENV || 'development'}] - ${new Date().toDateString()} / ${new Date().toLocaleTimeString()}`
  );
});
