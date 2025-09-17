// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect MongoDB Atlas (replace <username>, <password>, <dbname>)
mongoose
  .connect("mongodb+srv://sahil_kadam:S%402611s%402611@cluster0.qv1pggh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Booking schema
const bookingSchema = new mongoose.Schema({
  movie: String,
  date: String,
  time: String,
  seat: String,
  name: String,
});

const Booking = mongoose.model("Booking", bookingSchema);

// 📌 Get booked seats
app.get("/bookings", async (req, res) => {
  const { movie, date, time } = req.query;
  try {
    const bookings = await Booking.find({ movie, date, time });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// 📌 Add new booking
// 📌 Add new booking (multiple seats)
app.post("/bookings", async (req, res) => {
  const { movie, date, time, seats, name } = req.body; // seats = ["A1", "A2"]

  try {
    // check if any of the seats are already booked
    const existing = await Booking.find({ movie, date, time, seat: { $in: seats } });
    if (existing.length > 0) {
      const taken = existing.map(e => e.seat);
      return res.status(400).json({ message: `❌ Seats already booked: ${taken.join(", ")}` });
    }

    // create bookings for all seats
    const newBookings = seats.map(seat => ({ movie, date, time, seat, name }));
    await Booking.insertMany(newBookings);

    res.status(201).json({ message: "✅ Seats booked successfully!", seats });
  } catch (err) {
    res.status(500).json({ message: "Error booking seats" });
  }
});


app.listen(5000, () => console.log("🚀 Server running on port 5000"));
