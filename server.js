const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: 'http://localhost:8080'
}));

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://admin:Escel41066^@cluster0.khrogap.mongodb.net/?retryWrites=true&w=majority";

// Replace with your MongoDB connection string
const mongoDB = 'mongodb://localhost:27017';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());

// Schema for storing name and age
const personSchema = new mongoose.Schema({
  name: String,
  age: Number
});

const Person = mongoose.model('Person', personSchema);

// Endpoint to add a new person
app.post('/addPerson', async (req, res) => {
  try {
    const newPerson = new Person({
      name: req.body.name,
      age: req.body.age
    });

    await newPerson.save();
    res.status(201).send('Person added successfully');
  } catch (error) {
    res.status(400).send('Error adding person');
  }
});

// New GET endpoint to retrieve a person by name
app.get('/getPerson/:name', async (req, res) => {
  try {
    const person = await Person.findOne({ name: req.params.name });
    if (!person) {
      return res.status(404).send('Person not found');
    }
    res.status(200).json(person);
  } catch (error) {
    res.status(500).send('Error retrieving person');
  }
});

// Set up storage using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this uploads directory exists
  },
  filename: function (req, file, cb) {
    cb(null, "file" + "-" + Date.now())
  }
});

const upload = multer({ storage: storage });

// File schema and model
const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  createdAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

// API endpoint for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log(req)
  const file = new File({
    filename: req.body.name,
    path: req.file.path
  });

  try {
    const savedFile = await file.save();
    res.status(201).json({ message: 'File uploaded successfully', file: savedFile });
  } catch (err) {
    res.status(500).json({ message: 'Error saving file', error: err });
  }
});
// ... other imports and setup above

// Retrieve the list of files
app.get('/files', async (req, res) => {
  try {
    const files = await File.find({});
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving files', error: err });
  }
});

// ... the rest of your server code


// ... other code above

// Endpoint to delete a file by ID
app.delete('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    // If you are storing files on the server file system, add code to delete the file here
    // e.g., fs.unlinkSync(file.path);

    await File.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting file', error: err });
  }
});

// ... rest of the server code
// Endpoint to update a file's metadata
app.put('/files/:id', upload.single('file'), async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
	
    if (!file) {
      return res.status(404).send('File not found');
    }

    // Assuming you're updating the name of the file
    // Adjust according to your file schema   
	console.log("req.body.name")
	console.log(req.body.name)
	if (req.body.name) {
      file.filename = req.body.name;
    }
	console.log("File")
	console.log(file)
    await file.save();
    res.status(200).json({ message: 'File updated successfully', file });
  } catch (err) {
    res.status(500).json({ message: 'Error updating file', error: err });
  }
});

app.get('/files/checkNameUnique/:name', async (req, res) => {
  try {
    const existingFile = await File.findOne({ name: req.params.name });
    res.status(200).json({ isUnique: !existingFile });
  } catch (err) {
    res.status(500).json({ message: 'Error checking file name', error: err });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
