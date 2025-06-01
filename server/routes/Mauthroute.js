const express = require("express");
const { loginUser } = require("../App_controller/userlogin"); 
const {signupUser} = require ("../App_controller/Signup")
const Mrouter = express.Router();

Mrouter.post('/login', loginUser);
Mrouter.post ('/signup', signupUser);


module.exports = Mrouter;
