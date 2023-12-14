const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Replace with your MongoDB connection string
const mongoDB = 'mongodb://localhost:27017';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

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

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
