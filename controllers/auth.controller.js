import User from "../models/user.model.js"; 
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import { fMsg, generateCode, generateTokenAndSetCookie } from "../utils/libby.js"; // Import utility functions

export const register = async (req, res, next) => { 
  try {
    const { username, email, password, confirmPassword } = req.body; // Destructure request body

    if (password !== confirmPassword) { 
      return next(new Error("Password and Confirm Password do not match"));
    }

    const existingUser = await User.findOne({ email }); 
    if (existingUser) {
      return next(new Error("User already exists")); 
    }

    const inviteCode = generateCode(); // Generate invite code

    const encryptedPassword = await bcrypt.hash(password, 10); // Hash password
    let user = await User.create({ // Create new user
      username,
      email,
      password: encryptedPassword,
      inviteCode,
    });
    
    const returnUser = user.toObject(); // Convert user to plain object
    delete returnUser.password; // Remove password from response
    delete returnUser.__v; // Remove version key from response

    generateTokenAndSetCookie(res, user._id);// Generate token and set cookie

    fMsg(res, "User created successfully", returnUser, 201); 
  } catch (error) {
    next(error); 
  }
};
