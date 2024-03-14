import { Hono } from 'hono';
import user from './routes/user';
import blog from './routes/blog';
import {cors} from 'hono/cors'

// Create the main Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables: {
    userId: string
  }
}>();

app.use('/*', cors())
app.route('/api/v1/user', user);
app.route('/api/v1/blog', blog);

export default app;
