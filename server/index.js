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
  dotenv.config();


  // Middleware to handle JSON requests
  const app = express();
  app.use(express.json()); 
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
 

        app.use(session({
        secret: "supersecretkey",
        resave: false,
        saveUninitialized: true,
      }));

      // Configure Nodemailer transporter
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





  (async () => {
    await connectDB(); 
    app.listen(PORT, () => console.log(
      
    ));
  })();






