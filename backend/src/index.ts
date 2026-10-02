import express from 'express';

const app = express();
const port = process.env['PORT'] ?? 3001;

app.use(express.json());

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'HandyNG API is running' });
});

app.listen(port, () => {
  console.log(`HandyNG API running on port ${port}`);
});
