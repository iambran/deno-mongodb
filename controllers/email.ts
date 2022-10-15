import { config } from "https://deno.land/x/dotenv/mod.ts";
import { key } from "../utils/apiKey.ts";
import { create } from "https://deno.land/x/djwt@v2.7/mod.ts";

interface User {
  email: string;
  fullname: string;
  password?: string;
}

const { SENDINBLUE_API_KEY } = config();

export const verifyEmail = async (user: User) => {
  const jwt = await create({ alg: 'HS512', typ: 'JWT' }, { email: user.email }, key);
  const res = await fetch('https://api.sendinblue.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': SENDINBLUE_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: 'Demo app',
        email: 'noreply@demo.com'
      },
      to: [
        { name: user.fullname, email: user.email }
      ],
      subject: 'Please verify your email!',
      htmlContent: `
        <p>Hey ${user.fullname}, please verify your email.</p>
        <a href="http://localhost:3000/verify?token=${jwt}">Confirm Email Address</a>
      `
    })
  });

  if (res.status === 201) {
    return true;
  } else {
    return false;
  }
}