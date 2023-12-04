import express from 'express';
import homeRoutes from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/', homeRoutes);

app.listen(PORT, () => {
  console.log(`Server running in port: ${PORT}`);
});

export default app;
