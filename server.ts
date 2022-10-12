import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import router from './routes/routes.ts';

const PORT = 3000;
const app = new Application();

app.use(router.routes());

app.use(async (context, next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/static`,
      index: 'index.html'
    });
  } catch (error) {
    await next();
  }
});

app.use(router.allowedMethods());

console.log(`Server is running on port ${PORT}`);
await app.listen({ port: PORT });
