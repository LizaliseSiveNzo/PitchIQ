import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'PitchIQ' }));
app.use('/api', routes);

app.use(errorHandler);

export default app;
