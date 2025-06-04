import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = 3001;

app.use(cors()); 
app.use(express.json());
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
