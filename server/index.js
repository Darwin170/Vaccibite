  const express = require("express");
  const cors = require('cors');
  const dotenv = require("dotenv");
  const connectDB = require("./config/db");
  const authroute = require("./routes/authroute");
  const Mauthroute = require("./routes/Mauthroute");
  const path = require("path"); 
  dotenv.config();


  // Middleware to handle JSON requests
  const app = express();
  app.use(express.json()); 
  const allowedOrigins = [
  'https://vaccibite.onrender.com', 
  'http://localhost:8000',         
 
];

app.use(cors({
  origin: function (origin, callback) {
   
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


  const PORT = process.env.PORT || 8787;
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/auth', authroute);
  app.use('/mauth',Mauthroute);

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});



connectDB();
  (async () => {
    await connectDB(); 
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })();



