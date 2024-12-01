import client from '../db/db.js';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

const registerSchema = z.object({
  username: z
    .string()
    .email({ message: 'Invalid email address' })
    .max(50, 'Email must not exceed 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  birthdate: z.string().refine(
    (date) => {
      const birthdateObj = new Date(date);
      return !isNaN(birthdateObj.getTime());
    },
    { message: 'Invalid birthdate' }
  ),
  role: z.enum(['reserver', 'administrator'], { message: 'Invalid role' }),
});

async function isUniqueUsername(email) {
  const results = await client.queryArray(
    `SELECT username FROM zephyr_users WHERE username = $1`,
    [email]
  );
  return results.rows.length === 0;
}

export async function registerUser(c) {
  const body = await c.req.parseBody();

  const { username, password, birthdate, role } = body;
  try {
    registerSchema.parse({ username, password, birthdate, role });

    if (!(await isUniqueUsername(username))) {
      return c.text('Email already in use', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const result = await client.queryArray(
      `INSERT INTO zephyr_users (username, password_hash, role, birthdate)
       VALUES ($1, $2, $3, $4)`,
      [username, hashedPassword, role, birthdate]
    );

    return c.text('User registered successfully!');
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors from Zod
      return c.text(
        `Validation Error: ${error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }
    
    console.error(error);
    return c.text('Error during registration', 500);
  }
}
