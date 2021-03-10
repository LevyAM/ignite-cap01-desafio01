const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  //Retorna true caso exista um usuário com o username
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const altTodo = user.todos.find((todo) => todo.id === id);

  if(!altTodo){
    return response.status(404).json({error: "Todo doesnt exists"})
  }

  altTodo.title = title;
  altTodo.deadline = deadline;

  return response.status(200).json(altTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const altTodo = user.todos.find((todo) => todo.id === id);

  if(!altTodo){
    return response.status(404).json({error: "Todo doesnt exists"})
  }

  altTodo.done = true;

  return response.status(200).json(altTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const byeTodo = user.todos.find((todo) => todo.id === id);

  if(!byeTodo){
    return response.status(404).json({error: "Todo doesnt exists"})
  }

  user.todos.splice(byeTodo.id, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
