const express = require("express");
const multer = require('multer');

const { loginUser } = require("../App_controller/userlogin"); 
const { signupUser } = require("../App_controller/Signup");
const { addAnimalBite } = require("../App_controller/reportsanimalbite");
const { addMissinganimal } = require("../App_controller/reportmissinganimal");
const { addRoamingAnimal } = require("../App_controller/reportroaminganimal");

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const Mrouter = express.Router();

// Use 'image' consistently as the field name for file uploads
Mrouter.post('/missing', upload.single('image'), addMissinganimal);
Mrouter.post('/Roaming', upload.single('image'), addRoamingAnimal);
Mrouter.post('/a', upload.single('image'), addAnimalBite);

// Non-file routes
Mrouter.post('/login', loginUser);
Mrouter.post('/signup', signupUser);

module.exports = Mrouter;
