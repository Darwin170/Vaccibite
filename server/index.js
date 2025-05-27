  const express = require("express");
  const cors = require('cors');
  const dotenv = require("dotenv");
  const connectDB = require("./config/db");
  const authroute = require("./routes/authroute");
  const path = require("path"); 
  dotenv.config();


  // Middleware to handle JSON requests
  const app = express();
  app.use(express.json()); 
  app.use(cors({
  origin: 'https://vaccibite.onrender.com', 
  credentials: true
  }));

  connectDB();
  const PORT = process.env.PORT || 8787;
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/auth', authroute);

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});




  (async () => {
    await connectDB(); 
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })();



