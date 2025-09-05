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
const MongoStore = require("connect-mongo"); // You need to install connect-mongo if you haven't already
const http = require("http");
const { Server } = require("socket.io");
const xss = require("xss-clean");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require('morgan'); // For better logging


dotenv.config();

// Middleware to handle JSON requests
const app = express();
const server = http.createServer(app);

// Use morgan for logging HTTP requests
app.use(morgan('dev')); 
app.use(express.json());
app.use(xss());
app.use(helmet());

// CORS configuration for production
app.use(cors({
  origin: process.env.CLIENT_URL, // Use an environment variable for the client URL
  credentials: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration using MongoStore
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
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

// Socket.IO server setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // Use environment variable for production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("statusUpdate", (data) => {
    console.log("Status updated:", data);
    io.emit("notification", { message: `Status changed: ${data}` });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8787;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', authroute);
app.use('/mauth', Mauthroute);

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});


// Connect to DB and start the server
(async () => {
  try {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => { // Listen on all network interfaces
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1); // Exit with a failure code
  }
})();




