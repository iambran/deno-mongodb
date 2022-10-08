import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import router from './routes/routes.ts';

const PORT = 3000;
const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Server is running on port ${PORT}`);
await app.listen({ port: PORT });
