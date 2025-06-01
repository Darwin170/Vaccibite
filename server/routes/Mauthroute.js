const express = require("express");
const multer = require('multer');
const { loginUser } = require("../App_controller/userlogin"); 
const {signupUser} = require ("../App_controller/Signup");
const {addAnimalBite} = require("../App_controller/reportsanimalbite");
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });
const Mrouter = express.Router();

Mrouter.post('/login', loginUser);
Mrouter.post ('/signup', signupUser);
Mrouter.post('/a', upload.single('file'), addAnimalBite);

module.exports = Mrouter;
