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
const MongoStore = require('connect-mongo');
const Report = require('./model/reportsmodel');

const app = express();
const server = http.createServer(app);
app.use(express.json());
app.set('trust proxy', 1);
app.use(xss());
const corsOptions = {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    }
}));

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { msg: "Too many attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/auth/login", loginLimiter);
app.use("/auth/resend-otp", loginLimiter);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

   
    socket.on("join", (MuserId) => {
        socket.join(MuserId);
        console.log(`Mobile user ${MuserId} joined their room`);
    });

    


    socket.on("reportUpdated", async ({ reportId, status }) => {
        try {
            const report = await Report.findById(reportId);

            if (!report) {
                console.error('Report not found for socket event (Invalid _id):', reportId);
                return;
            }

            // 🎯 CRITICAL FIX: Check if report.userId exists before calling .toString()
            if (!report.userId) {
                console.warn(`Report ${reportId} is missing a user ID. Skipping notification.`);
                return; // Exit if there's no user to notify
            }
            
            // ✅ Safe access: We now know report.userId exists
            const MuserId = report.userId.toString(); 

            // Emit the notification to the user's room
            io.to(MuserId).emit('reportStatusNotification', {
                // Ensure all fields are correctly converted to simple strings for socket transport
                reportId: report._id.toString(),
                newStatus: status,
                message: `Your report (ID: ${report._id.toString().substring(0, 8)}...) status has been updated to ${status}.`
            });

            console.log(`Notification sent to user ${MuserId} for report ${report._id}`);

        } catch (error) {
            // This catch block will now only handle actual Mongoose/database errors
            console.error('Error handling reportUpdated event:', error);
        }
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





