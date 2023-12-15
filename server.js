const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const serveStatic = require('serve-static');
const path = require('path');
const fs = require('fs');

const uploadPath = 'uploads/';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const allowedOrigins = [
  'http://localhost:3000',
  'https://intern-web-b420a534061a.herokuapp.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://admin:Escel41066^@cluster0.khrogap.mongodb.net/?retryWrites=true&w=majority";

// Replace with your MongoDB connection string
const mongoDB = 'mongodb://localhost:27017';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// app.use('/', serveStatic(path.join(__dirname, '/dist')));

// app.get('*', (req, res) => {
//   res.sendFile(__dirname + '/dist/index.html');
// });


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());

// Schema for storing name and age
const personSchema = new mongoose.Schema({
  name: String,
  age: Number
});

// Schema for storing name and age
const errorSchema = new mongoose.Schema({
  errorId: String,
  errorMessage: Number
});

// File schema and model
const fileSchema = new mongoose.Schema({
  originalName: String,
  filenameInput: String,
  extName: String,
  filename: String,
  path: String,
  mimeType: String,
  createdAt: { type: Date, default: Date.now }
});

const Person = mongoose.model('Person', personSchema);
const Error = mongoose.model('Error', errorSchema);
const File = mongoose.model('File', fileSchema);

// Set up storage using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath) // Make sure this uploads directory exists
  },
  filename: function (req, file, cb) {
    setImmediate(() => {
      // Access the text field 'name' sent along with the file
      const name = req.body.name || '';

      // Create a new filename
      const newFileName = name + Date.now() + path.extname(file.originalname)
      cb(null, newFileName);
    });
  }
});
const upload = multer({ storage: storage });

// API endpoint for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const fileExtension = path.extname(req.file.originalname);
  const existingFile = await File.findOne({ filename: req.file.filename });
    if (existingFile) {
      return res.status(400).json({ message: 'Filename already exists' });
    }
  console.log(req.file)
  const mimeType = req.file.mimetype;
  const originalName = req.file.originalname; // Accessing original file name
  const file = new File({
    filename: req.file.filename,
    filenameInput: req.body.name,
    path: uploadPath + req.file.filename,
    extName: fileExtension,
    mimeType: mimeType,
    originalName: originalName
  });

  try {
    const savedFile = await file.save();
    res.status(201).json({ message: 'File uploaded successfully', file: savedFile });
  } catch (err) {
    const { v4: uuidv4 } = require('uuid');

    const error = new Error({
      uuidv4,
      err
    })
    const saveError = await error.save();
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

    const error = new Error({
      uuidv4,
      err
    })
    const saveError = await error.save();

    res.status(500).json({ message: 'Error retrieving files', error: err });
  }
});

// ... the rest of your server code


// ... other code above

// Endpoint to delete a file by ID
app.delete('/files/:id', async (req, res) => {
  try {
    console.log("Deleting...")
    const fs = require('fs').promises; // Use the promise-based version of fs
    console.log(req.params.id)
    console.log("req.params.id")
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }

    // Define the directory where your files are stored
    console.log(file)
    const fileDirectory = path.join(__dirname, 'uploads');
    const filePath = path.join(fileDirectory, file.filename);
    console.log("FilePath")
    console.log(filePath)
    // Delete the file from the file system
      await fs.access(filePath, fs.constants.F_OK);
      await fs.unlink(filePath);
      console.log("File deleted successfully");

    // Delete the file record from the database
    await File.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error deleting file', error: err.message });
  }
});

app.put('/files/:id', upload.single('file'), async (req, res) => {
  try {
    const fs = require('fs').promises;
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).send('File not found');
    }
    console.log("TEST1");
    // If a new file is uploaded
    if (req.file) {
      console.log("TEST2")
      // Delete the old file from the filesystem
      const oldFilePath = path.join(__dirname, 'uploads', file.filename);
      console.log("TEST3")
      await fs.unlink(oldFilePath).catch(err => console.log('Error deleting old file:', err));
      console.log(file)
      // Update file metadata with new file info
      file.filename = req.file.filename;
      file.originalName = req.file.originalname;
      file.mimeType = req.file.mimetype;
      file.extName = path.extname(req.file.filename);
      // Add any other relevant fields from req.file
    }

    // Update other metadata from req.body
    if (req.body.name) {
      file.filenameInput = req.body.name; // or any other field you wish to update
    }
    console.log("TEST5")
    await file.save();
    res.status(200).json({ message: 'File updated successfully', file });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error updating file', error: err.message });
  }
});

app.get('/files/checkNameUnique/:name', async (req, res) => {
  try {
    const existingFile = await File.findOne({ name: req.params.name });
    res.status(200).json({ isUnique: !existingFile });
  } catch (err) {

    const error = new Error({
      uuidv4,
      err
    })
    const saveError = await error.save();

    res.status(500).json({ message: 'Error checking file name', error: err });
  }
});


app.get('/files/download/:fileId', async (req, res) => {
  const fileId = req.params.fileId;
  const fileRecord = await File.findById(fileId);
  if (!fileRecord) {
    return res.status(404).send('File not found');
  }

  const fileDirectory = path.join(__dirname, 'uploads');
  
  // Use fileRecord.filename which should include the file name with its extension
  
  const filePath = path.join(fileDirectory, fileRecord.filename);
  console.log(fileRecord)
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }

    const fileExtension = fileRecord.extName; // Ensure this gets the correct extension


    // Ensure the filename in the header includes the correct extension
    const fileNameHeader = `attachment; filename="${encodeURIComponent(fileRecord.filenameInput)}${fileExtension}"`;
    console.log(fileNameHeader)
    res.setHeader('Content-Disposition', fileNameHeader);

    // Set MIME type
    console.log(fileRecord.mimeType);
    res.setHeader('Content-Type', fileRecord.mimeType || 'application/octet-stream');

    // Stream the file to the client
    fs.createReadStream(filePath).pipe(res);
  });
});



const port = process.env.PORT || 5000;
app.listen(port);