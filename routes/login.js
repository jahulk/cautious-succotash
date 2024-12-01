import client from '../db/db.js';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';
import { getConnInfo } from '@hono/hono/deno';

const loginSchema = z.object({
  username: z.string().email({ message: 'Invalid email address' }),
});

async function logLogin(userUUID, ipAddress) {
  try {
    await client.queryArray(
      `INSERT INTO login_logs (user_token, ip_address) VALUES ($1, $2)`,
      [userUUID, ipAddress]
    );
  } catch (error) {
    console.error('Error logging login event:', error);
  }
}

async function getUserByEmail(email) {
  const result = await client.queryArray(
    `SELECT username, password_hash, user_token, role FROM zephyr_users WHERE username = $1`,
    [email]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function loginUser(c) {
  const body = await c.req.parseBody();

  const { username, password } = body;
  try {
    loginSchema.parse({ username: username });
    const user = await getUserByEmail(username);

    if (!user) {
      return c.text('User not found', 404);
    }

    const [storedUsername, storedPasswordHash, userUUID, role] = user;
    const isPasswordCorrect = await bcrypt.compare(
      password,
      storedPasswordHash
    );
    if (!isPasswordCorrect) {
      return c.text('Invalid email or password', 401);
    }

    // Log the login event
    const info = getConnInfo(c);
    await logLogin(userUUID, info.remote.address);

    return c.text(`Welcome back, ${storedUsername}!`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors from Zod
      return c.text(
        `Validation Error: ${error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    console.error(error);
    return c.text('Error during login', 500);
  }
}
