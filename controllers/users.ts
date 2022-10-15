import { config } from "https://deno.land/x/dotenv/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { key } from "../utils/apiKey.ts";
import { decode } from "https://deno.land/x/djwt@v2.7/mod.ts";
import { sendEmail } from './email.ts';

const { DATA_API_KEY, APP_ID } = config();

const BASE_URI =
  `https://data.mongodb-api.com/app/${APP_ID}/endpoint/data/v1/action`;
const DATA_SOURCE = "Cluster0";
const DATABASE = "user_db";
const COLLECTION = "users";

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "api-key": DATA_API_KEY,
  },
  body: "",
};

const base_query = {
  collection: COLLECTION,
  database: DATABASE,
  dataSource: DATA_SOURCE,
};

export const signup = async ({ request, response }: { request: any; response: any }) => {
  try {
    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        message: 'No data'
      }
    } else {
      const body = await request.body();
      const user = await body.value;
      // console.log(user);
      const salt = await bcrypt.genSalt(8);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      console.log(user.password, hashedPassword);
      const URI = `${BASE_URI}/insertOne`;
      const query = {
        ...base_query,
        document: {
          ...user,
          password: hashedPassword,
          verified: false
        }
      }

      options.body = JSON.stringify(query);
      const dataResponse = await fetch(URI, options);
      const { insertedId } = await dataResponse.json();

      const emailSent = await sendEmail(user);

      console.log(emailSent);

      if (emailSent) {
        response.status = 201;
        response.body = {
          success: true,
          email: user.email,
        }
      } else {
        response.status = 500; // 这里的代码我不是很确定
        response.body = {
          success: false,
          message: '无法验证您的邮件，请稍后再试！'
        }
      }
    }
  } catch (error) {
    response.body = {
      success: false,
      message: error.toString()
    }
  }
}

export const verifyEmail = async ({ request, response }: { request: any; response: any }) => {
  try {
    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        message: 'No data'
      }
    } else {
      const body = await request.body();
      const { token } = await body.value;
      console.log(token);
      const [header, payload, signature] = await decode(token, key);
      console.log(payload);

      const URI = `${BASE_URI}/updateOne`;
      const query = {
        ...base_query,
        filter: {
          email: payload.email
        },
        update: {
          $set: {
            verified: true
          }
        }
      }

      options.body = JSON.stringify(query);
      const updateResponse = await fetch(URI, options);
      const updateData = await updateResponse.json();
      console.log(updateData);
      response.status = 200;
      response.body = {
        success: true,
        updateData
      }
    }
  } catch (error) {
    response.body = {
      success: false,
      message: error.toString()
    }
  }
}