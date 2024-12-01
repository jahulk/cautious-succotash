// import { Hono } from 'https://deno.land/x/hono@v4.3.11/mod.ts';
import * as hono from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import { secureHeaders } from "@hono/hono/secure-headers";
// import {
//   secureHeaders,
//   serveStatic,
// } from 'https://deno.land/x/hono@v4.3.11/middleware.ts';

import { registerUser } from './routes/register.js';
import { loginUser } from './routes/login.js';

const app = new hono.Hono();
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
    },
  })
);
app.use('/static/*', serveStatic({ root: './' }));

app.get('/', async (c) => {
  return c.html(await Deno.readTextFile('./views/index.html'));
});

app.get('/register', async (c) => {
  return c.html(await Deno.readTextFile('./views/register.html'));
});

app.get('/login', async (c) => {
  return c.html(await Deno.readTextFile('./views/login.html'));
});

app.post('/register', registerUser);
app.post('/login', loginUser);

Deno.serve(app.fetch);

// The Web app starts with the command:
// deno run --allow-net --allow-env --allow-read --watch app.js
// docker exec -it booking_system_database psql -U postgres -d postgres
// curl -X POST localhost:8000/register -d "username=john.doe" -d "password=1234" -d "birthdate=01/01/1999" -d "role=reserver"
