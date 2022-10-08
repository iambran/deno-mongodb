import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
  addTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  getIncompleteTodos
} from "../controllers/todos.ts";


const router = new Router();

router
  .post('/api/todos', addTodo)
  .get('/api/todos', getTodos)
  .get('/api/todos/:id', getTodo)
  .get('/api/todos/incomplete/count', getIncompleteTodos)
  .put('/api/todos/:id', updateTodo)
  .delete('/api/todos/:id', deleteTodo);



export default router;