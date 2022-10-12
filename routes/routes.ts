import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
  addTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  getIncompleteTodos
} from "../controllers/todos.ts";

import { signup } from "../controllers/users.ts";

const router = new Router();

router
  .post('/api/todos', addTodo)
  .get('/api/todos', getTodos)
  .get('/api/todos/:id', getTodo)
  .get('/api/todos/incomplete/count', getIncompleteTodos)
  .put('/api/todos/:id', updateTodo)
  .delete('/api/todos/:id', deleteTodo);

router.post('/api/users/signup', signup);

export default router;