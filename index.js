const { log } = require("console");
const express = require("express");
const cors = require("cors");

const app = express();

/* MIDDLEWARE */

app.use(cors());
app.use(express.json());

const requestLogger = (request, response, next) => {
  console.log("Method: ", request.method);
  console.log("Path: ", request.path);
  console.log("Body: ", request.body); // injected by the json middleware
  console.log("---");
  next();
};

app.use(requestLogger);

/* DATA */

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

/* ENDPOINTS */

app.get("/", (request, response) => {
  response.send("<h1>Hello World!!!</h1>");
});

app.get("/api/notes", (request, response) => {
  response.json(notes);
});

app.get("/api/notes/:id", (request, response) => {
  const noteId = request.params.id;
  const note = notes.find((n) => {
    return n.id === noteId;
  });

  if (note) {
    response.json(note);
  } else {
    response.statusMessage = `The note ${noteId} cannot be found.`;
    response.status(404).end();
  }
});

app.delete("/api/notes/:id", (request, response) => {
  const noteId = request.params.id;
  notes = notes.filter((n) => {
    return n.id !== noteId;
  });
  response.status(204).end();
});

const generateId = () => {
  if (notes.length === 0) {
    return 1;
  }

  return (
    Math.max(
      ...notes.map((n) => {
        return Number(n.id);
      })
    ) + 1
  );
};

app.post("/api/notes", (request, response) => {
  console.log(notes);

  // validate that content property exists
  const note = request.body;
  if (!note.content) {
    return response
      .status(400)
      .json({ error: "Property 'content' is missing." });
  }

  // generate new id
  const newId = generateId();

  // create new note
  const newNote = {
    content: note.content,
    important: Boolean(note.important) || false,
    id: newId,
  };

  // save new note to notes
  notes = notes.concat(newNote);

  // produce response with new note
  response.json(newNote);
});

/* MIDDLEWARE 2 */

const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: "Unkonwn endpoint." });
};

app.use(unknownEndpoint);

/* APP CONFIG */

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
