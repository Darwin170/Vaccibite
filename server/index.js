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
      const http = require("http");
      const { Server } = require("socket.io");
      const xss = require("xss-clean");
      const helmet = require("helmet");
      const rateLimit = require("express-rate-limit");
      
      // Middleware to handle JSON requests
      const app = express();
      const server = http.createServer(app);
      app.use(express.json()); 
      app.use(xss());
      const corsOptions = {
        origin:  process.env.CLIENT_URL, // Or specify your frontend URL
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
      };
      app.use(cors(corsOptions));
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(helmet());


            app.use(session({
            secret: process.env.JWT_SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
              httpOnly: true,   
              secure: true,     
              sameSite: "strict"
                }
          }));

          const loginLimiter = rateLimit({
              windowMs: 15 * 60 * 1000, // 15 minutes
              max: 5, // 5 attempts per 15 mins
              message: { msg: "Too many attempts, please try again later." },
              standardHeaders: true,
              legacyHeaders: false,
            });

            
            app.use("/auth/login", loginLimiter);
            app.use("/auth/resend-otp", loginLimiter);

          // Configure Nodemailer transporter
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const io = new Server(server, {
          cors: {
        origin: "*", // or your Flutter app's URL
        methods: ["GET", "POST"]
          }
          });

              io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // Join a room for the mobile user
        socket.on("join", (MuserId) => {
          socket.join(MuserId); // MuserId is from the mobile user model
          console.log(`Mobile user ${MuserId} joined their room`);
        });

        socket.on("disconnect", () => {
          console.log("User disconnected:", socket.id);
        });
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
  server.listen(PORT, () => {   
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
