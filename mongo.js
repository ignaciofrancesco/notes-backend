const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument.");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://ignaciofrancesco:${password}@cluster0.rwj6k.mongodb.net/NotesApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

// Connect to DB
mongoose.connect(url);

// Declare a Schema
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

// Compile the schema to a Model
const Note = mongoose.model("Note", noteSchema);

Note.find({ important: true }).then((result) => {
  result.forEach((note) => {
    console.log(note);
  });
  mongoose.connection.close();
});

/* // Use the Model to create a new Document
const note = new Note({
  content: "JS is the best for interactivity.",
  important: true,
});

// Save the Document to DB
note.save().then((result) => {
  console.log("note saved!");
  mongoose.connection.close();
}); */
