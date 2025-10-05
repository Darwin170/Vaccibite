import React, { useState, useEffect, useRef } from "react";
// ... (other imports remain the same)
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./OtpVerification.css";
// import { useAuth } from "../routes/AuthContext";

const OTP_LENGTH = 6; // Define the OTP length

const OtpVerification = () => {
    // 1. Initialize OTP state as an array of empty strings
    const [otpArray, setOtpArray] = useState(new Array(OTP_LENGTH).fill(""));
    const [message, setMessage] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const email = sessionStorage.getItem("pendingEmail");

    // Create an array of refs to reference each input box
    const inputRefs = useRef([]);

    // Get the combined OTP string for the API call
    const otp = otpArray.join("");

    // Function to handle input changes in the OTP boxes
    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        // Ensure only one character is processed
        if (value.length > 1) return;

        // Create a copy of the array and update the value at the current index
        const newOtpArray = [...otpArray];
        newOtpArray[index] = value;
        setOtpArray(newOtpArray);

        // Auto-focus logic: Move to the next input if a digit was entered
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Function to handle backspace/delete key
    const handleKeyDown = (e, index) => {
        // If the key is 'Backspace' or 'Delete' and the current box is empty
        if ((e.key === "Backspace" || e.key === "Delete") && !otpArray[index] && index > 0) {
            // Move focus to the previous input
            inputRefs.current[index - 1].focus();
        }
    };

    // --- (The handleVerify, handleResendOtp, and useEffect logic remain the same) ---

    // IMPORTANT: Update handleVerify to use the combined `otp` string
    const handleVerify = async (e) => {
        e.preventDefault();
        // ... rest of the handleVerify function using the combined `otp` string
        if (otp.length !== OTP_LENGTH) {
            setMessage(`OTP must be ${OTP_LENGTH} digits.`);
            return;
        }

        // ... (rest of your existing handleVerify logic)
        if (!email) {
             setMessage("Email not found. Please login again.");
             return;
           }

           try {
             const res = await axios.post(
               `${process.env.REACT_APP_API_URL}/auth/verify`,
               { email, otp }, // Now uses the combined OTP
               { withCredentials: true }
             );
           // ... (rest of existing success logic)
           const { user, token } = res.data;

           localStorage.setItem("user", JSON.stringify(user));
           localStorage.setItem("token", token);
           
           login({
             username: user.username || user.email,
             role: user.position,
             _id: user._id,
             token,
           });

           sessionStorage.removeItem("pendingEmail");
           setMessage(res.data.msg);
        if (user.position === "System_Admin") {
                navigate("/System_Admin/UserManagement", { replace: true });
              } else if (user.position === "Admin") {
                navigate("/Admin/Dashboard", { replace: true });
              } else if (user.position === "Super_Admin") {
                navigate("/Superadmin/SystemAdmin", { replace: true });
              } else {
                setMessage("Account has been deactivated or role not recognized.");
              }

           } catch (err) {
             const status = err.response?.status;
             const backendMsg = err.response?.data?.msg;

             if (status === 400 || status === 404) {
               setMessage(backendMsg || "Invalid OTP or request.");
             } else {
               setMessage("Verification failed due to a server error.");
             }
           }
    };
    
    // ... (Your existing handleResendOtp and useEffect remain here) ...
    const handleResendOtp = async () => {
        if (!email) {
          setMessage("Email not found. Please login again.");
          return;
        }
        if (cooldown > 0) return;

        try {
          const res = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/resend-otp`,
            { email },
            { withCredentials: true }
          );
          setMessage(res.data.msg || "A new OTP has been sent.");
          setCooldown(30);
        } catch (err) {
          setMessage(err.response?.data?.msg || "Failed to resend OTP.");
        }
      };

    useEffect(() => {
        if (cooldown > 0) {
          const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
          return () => clearInterval(timer);
        }
    }, [cooldown]);


    return (
        <div className="otp-container">
            <h2>OTP Verification</h2>
            <form onSubmit={handleVerify}>
                {/* 2. OTP BOXES: Replace the single input with this structure */}
                <div className="otp-input-boxes">
                    {otpArray.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            inputMode="numeric" // Optimizes for mobile number pad
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            ref={(el) => (inputRefs.current[index] = el)} // Assign the ref
                            required
                        />
                    ))}
                </div>
                {/* -------------------------------------------------------- */}
                <button type="submit">Verify OTP</button>
            </form>
            <button onClick={handleResendOtp} disabled={cooldown > 0}>
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default OtpVerification;
