import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts';
import { secureHeaders } from 'https://deno.land/x/hono@v4.3.11/middleware.ts';
import { registerUser } from './routes/register.js';

const app = new Hono();
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: 'self',
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  })
);

// Serve the registration form
app.get('/register', async (c) => {
  return c.html(await Deno.readTextFile('./views/register.html'));
});

// Handle user registration (form submission)
app.post('/register', registerUser);

Deno.serve(app.fetch);

// The Web app starts with the command:
// deno run --allow-net --allow-env --allow-read --watch app.js

// curl -X POST localhost:8000/register -d "username=john.doe" -d "password=1234" -d "birthdate=01/01/1999" -d "role=reserver"
