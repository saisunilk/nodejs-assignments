import http from "http";
import url from "url";

let todos = [];
let idCounter = 1;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  const sendJson = (status, data) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  // ✅ ROOT
  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("Hello World");
  }

  // ✅ CREATE TODO
  else if (req.method === "POST" && pathname === "/create/todo") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { title, description } = JSON.parse(body);

        if (!title || !description) {
          return sendJson(400, { error: "Invalid input" });
        }

        const newTodo = {
          id: idCounter++, // ✅ correct auto increment
          title,
          description,
        };

        todos.push(newTodo);

        return sendJson(200, todos); // ✅ return full array
      } catch {
        return sendJson(400, { error: "Invalid JSON" });
      }
    });
  }

  // ✅ GET ALL TODOS
  else if (req.method === "GET" && pathname === "/todos") {
    return sendJson(200, todos); // ✅ IMPORTANT RETURN
  }

  // ✅ GET SINGLE TODO
  else if (req.method === "GET" && pathname === "/todo") {
    const id = parseInt(query?.id);

    if (!query || isNaN(id)) {
      return sendJson(404, { error: "Invalid ID" });
    }

    const todo = todos.find((t) => t.id === id);

    if (!todo) {
      return sendJson(404, { error: "Todo not found" });
    }

    return sendJson(200, todo);
  }

  // ✅ DELETE TODO
  else if (req.method === "DELETE" && pathname === "/todo") {
    const id = parseInt(query?.id);

    if (!query || isNaN(id)) {
      return sendJson(404, { error: "Invalid ID" });
    }

    const index = todos.findIndex((t) => t.id === id);

    if (index === -1) {
      return sendJson(404, { error: "Todo not found" });
    }

    todos.splice(index, 1);

    return sendJson(200, { message: "Deleted successfully" });
  }

  // ✅ DEFAULT
  else {
    return sendJson(404, { error: "Route not found" });
  }
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});