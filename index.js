require("dotenv").config();
const { log } = require("console");
const express = require("express");
const cors = require("cors");
const Note = require("./models/note");

const app = express();

/* MIDDLEWARE */

// Tells express to serve static files if any, from the "dist" folder.
app.use(express.static("dist"));
// Allows the cross origin requests
app.use(cors());
// Parses json into js objects --> loads the request with a "body" object, so we can use request.body
app.use(express.json());
// Logs to console
const requestLogger = (request, response, next) => {
  console.log("Method: ", request.method);
  console.log("Path: ", request.path);
  console.log("Body: ", request.body); // injected by the json middleware
  console.log("---");
  next();
};
app.use(requestLogger);

/* DATA */

/* ENDPOINTS */

app.get("/api/notes", (request, response) => {
  Note.find({}).then((n) => {
    response.json(n);
  });
});

app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (!note) {
        return response.status(404).end();
      }

      response.json(note);
    })
    .catch((error) => next(error));
});

app.delete("/api/notes/:id", (request, response, next) => {
  const noteId = request.params.id;

  Note.findByIdAndDelete(noteId)
    .then((result) => {
      console.log(result);
      response.status(204).end();
    })
    .catch((error) => {
      return next(error);
    });
});

app.post("/api/notes", (request, response, next) => {
  // validate that content property exists
  const body = request.body;
  if (body.content === undefined) {
    return response
      .status(400)
      .json({ error: "Property 'content' is missing." });
  }

  // Create new note using the mongoose model
  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  // Save note to DB
  note
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

app.put("/api/notes/:id", (request, response, next) => {
  const noteId = request.params.id;
  const { content, important } = request.body;

  const note = {
    content: content,
    important: important,
  };

  Note.findByIdAndUpdate(noteId, note, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

/* MIDDLEWARE 2 */

// Handler for unknown endpoints
const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: "Unkonwn endpoint." });
};
app.use(unknownEndpoint);

// Handler for requests with result to errors
const errorHandler = (error, request, response, next) => {
  console.log("ERROR.", error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

/* APP CONFIG */

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
