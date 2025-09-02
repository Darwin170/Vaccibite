const express = require("express");
const { upload } = require("../middleware/upload"); // use diskStorage middleware
const { loginUser } = require("../App_controller/userlogin"); 
const { signupUser } = require("../App_controller/Signup");
const { addAnimalBite } = require("../App_controller/reportsanimalbite");
const { addMissinganimal } = require("../App_controller/reportmissinganimal");
const { addRoamingAnimal } = require("../App_controller/reportroaminganimal");
const {verify}= require("../App_controller/verify");
const { sendOTP } = require("../App_controller/otpController");
const {markAsRead}= require("../App_controller/markAsRead");
const {getUserNotifications}= require ("../App_controller/getNotification");

const Mrouter = express.Router();

// These now save files in /uploads and make them downloadable
Mrouter.get("/getnotify/:receiverId", getUserNotifications);
Mrouter.patch("/readmark/:id", markAsRead);
Mrouter.post("/send", sendOTP);
Mrouter.post('/missing', upload.single('file'), addMissinganimal);
Mrouter.post('/Roaming', upload.single('file'), addRoamingAnimal);
Mrouter.post('/a', upload.single('file'), addAnimalBite);
Mrouter.post('/verification', verify);
Mrouter.post('/login', loginUser);
Mrouter.post('/signup', signupUser);

module.exports = Mrouter;







