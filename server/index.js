  const express = require("express");
  const cors = require("cors");
  const dotenv = require("dotenv");
  const connectDB = require("./config/db");
  const authroute = require("./routes/authroute");
  const Mauthroute = require("./routes/Mauthroute");
  const path = require('path');
  const nodemailer = require("nodemailer");
  const bodyParser = require("body-parser");
  const session = require("express-session");
  const MongoStore = require("connect-mongo");
  dotenv.config();


  // Middleware to handle JSON requests
  const app = express();
  app.use(express.json()); 
 app.use(cors({
  origin: 'https://vaccibite.onrender.com',
  credentials: true,
}));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());


 app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:process.env.MONGODB_URL, // same URI from your db config
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    httpOnly: true,
    secure: false, // set to true in production (https)
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  const PORT = process.env.PORT || 8787;
 
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.use('/auth', authroute);
  app.use('/mauth',Mauthroute);



app.get("/", (req, res) => {
  res.send("Server is running ✅");
});


  (async () => {
    await connectDB(); 
    app.listen(PORT, () => console.log(
      
    ));
  })();











