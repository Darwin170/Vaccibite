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
const {getDistrictAndBarangay} = require('../App_controller/getdata');
const {sendotp}= require("../App_controller/otpsend");
const{verifyPasswordResetOTP }=require("../App_controller/verifyPasswordResetOTP");
const{resetPassword} =require("../App_controller/resetPassword");
const {authMiddleware} = require("../middleware/authMiddleware");
const { recordEventPageClick } = require('../controller/recordEventPageClick'); 
const Mrouter = express.Router();


// These now save files in /uploads and make them downloadable
router.post('/track/event-page-click', authMiddleware, recordEventPageClick);
Mrouter.post("/resetPassword",resetPassword);
Mrouter.post ("/sendotp",sendotp);
Mrouter.post("/verifyPasswordResetOTP",verifyPasswordResetOTP);
Mrouter.get('/:userId/location',getDistrictAndBarangay);
Mrouter.get('/getnotify/:receiverId', getUserNotifications);
Mrouter.patch('/readmark/:id', markAsRead);
Mrouter.post("/send", sendOTP);
Mrouter.post('/missing', authMiddleware,upload.single('image'), addMissinganimal);
Mrouter.post('/Roaming',authMiddleware, upload.single('image'), addRoamingAnimal);
Mrouter.post('/a',authMiddleware, upload.single('image'), addAnimalBite);
Mrouter.post('/verification', verify);
Mrouter.post('/login',  loginUser);
Mrouter.post('/signup', signupUser);

module.exports = Mrouter;






















