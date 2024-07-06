const express = require("express");
const collection = require("./mongo");
const bookingend = require("./bookingend");
const mongoose = require('mongoose');
// Ensure this is the correct model name
const cors = require("cors");
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const check = await collection.findOne({ email, password });

    if (check) {
      res.json("exist");
    } else {
      res.json("not exist");
    }
  } catch (e) {
    res.json("not exist");
  }
});

app.post("/signup", async (req, res) => {
  const { email, password, username } = req.body;

  const data = {
    username,
    email,
    password,
  };

  try {
    const check = await collection.findOne({ email });

    if (check) {
      res.json("exist");
    } else {
      await collection.insertMany([data]);
      res.json("not exist");
    }
  } catch (e) {
    res.json("not exist");
  }
});

app.post("/", async (req, res) => {
  const { name, sourceLocation, destinationLocation, travelDate, busType, seats } = req.body;

  const data = { name, sourceLocation, destinationLocation, travelDate, busType, seats };

  try {
    const check = await bookingend.findOne({ name });

    if (check) {
      res.json("exist");
    } else {
      await bookingend.insertMany([data]);
      res.json("not exist");
    }
  } catch (e) {
    res.json("not exist");
  }
});

app.post("/chatbot", async (req, res) => {
  const { name, sourceLocation, destinationLocation, travelDate, busType, seats, optionValue } = req.body;

  const data = { name, sourceLocation, destinationLocation, travelDate, busType, seats };

  try {
    if (optionValue === "Booking") {
      const check = await bookingend.findOne({ name });

      if (!check) {
        // If no entry with the same name exists, handle booking
        await bookingend.insertMany(data);
        res.json("Successfully booked the bus tickets!");
      } else {
        res.status(400).json("Booking failed: Ticket already booked for this name.");
      }
    } else if (optionValue === "Cancellation") {
      const check = await bookingend.findOne({ name });

      if (check) {
        // If entry with the same name exists, handle cancellation
        await bookingend.deleteOne({ name });
        res.json("Tickets cancelled");
      } else {
        res.status(400).json("Cancellation failed: No booking found for this name.");
      }
    } else {
      res.status(400).json("Invalid optionValue provided.");
    }
  } catch (e) {
    // Handle any errors that occur during MongoDB operations
    console.error("Error in processing request:", e);
    res.status(500).json("An error occurred while processing the request.");
  }
});

app.get('/download', async (req, res) => {
  try {
    const name = req.query.name;
    const userData = await bookingend.findOne({ name });

    if (userData) {
      const { name, sourceLocation, destinationLocation, travelDate, busType, seats } = userData;
      res.json({ name, sourceLocation, destinationLocation, travelDate, busType, seats });
    } else {
      res.status(404).json({ message: 'name not found' });
    }
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.listen(8000, () => {
  console.log("port is connected");
});
