import jwt from "jsonwebtoken";
import User from "../models/users.js";
import Mentorship from "../models/mentorship.js";
// import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import cloudinary from "../utils/cloudinary.js";

// retryRequest function for retrying email sending
async function retryRequest(requestPromise, retryCount = 0) {
  const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff delay
  return requestPromise.catch((error) => {
    if (error.code === "EAI_AGAIN" && retryCount < 3) {
      // console.log(
      //   `DNS lookup failed for ${error.config.url}. Retrying attempt ${
      //     retryCount + 1
      //   } after ${delay}ms`
      // );
      return new Promise((resolve) =>
        setTimeout(
          () => resolve(retryRequest(requestPromise, retryCount + 1)),
          delay
        )
      );
    } else {
      throw error;
    }
  });
}

export const createUser = async (req, res) => {
  const { name, phone, password, email, agreeTerms, role } = req.body;

  // console.log(req.body);
  try {
    // Check if the user with the same phone number or email already exists
    const existingUser = await User.findOne({
      $or: [{ phoneNumber: phone }, { email }],
    });
    if (existingUser) {
      // console.log(existingUser.phoneNumber, existingUser.email);
      return res.status(400).json({
        error: "User with this phone number or email already exists",
      });
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Create a new user object
    const newUser = new User({
      fullName: name,
      phoneNumber: phone,
      password,
      email,
      agreeTerms,
      role,
      verificationCode,
      verificationCodeExpires: Date.now() + 3600000, // 1 hour
    });
    // Configure the email transport using environment variables
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL/TLS
      auth: {
        user: "mulukendemis44@gmail.com",
        pass: "jnko xwtx rcvd plgq", // Use your Gmail app password or account password
      },
    });
    // Define email options
    const mailOptions = {
      from: "mulukendemis44@gmail.com",
      to: email,
      subject: "Email Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    };
    // Send the verification email
    await retryRequest(transporter.sendMail(mailOptions));
    // console.log("Email sent successfully");
    // Save the new user to the database
    const savedUser = await newUser.save();

    // console.log(savedUser);
    // Respond to the client
    res.status(201).json({
      user: savedUser,
      message:
        "Your account was created successfully. Please check your email for the verification code.",
    });
  } catch (error) {
    console.error("Error during user creation:", error);
    // console.log("error code", error.code);
    if (error.code === "ESOCKET" || error.code === "ECONNREFUSED") {
      return res.status(504).json({ error: "Your connection is unstable" });
    }
    res.status(500).json({ error: "An error occurred while signing up" });
  }
};

// Get all mentors
export const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" });
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all mentors by role and optionally by category
export const getMentorsByCategory = async (req, res) => {
  const { category } = req.query;
  try {
    const mentors = await User.find({ category, role: "mentor" });
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
    // console.log(error.message);
  }
};

// Get all mentees
export const getAllMentees = async (req, res) => {
  try {
    const mentees = await User.find({ role: "mentee" });
    res.status(200).json(mentees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get mentor by ID
export const getMentorById = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id);
    if (!mentor || mentor.role !== "mentor") {
      return res.status(404).json({ error: "Mentor not found" });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get mentee by ID
export const getMenteeById = async (req, res) => {
  try {
    const mentee = await User.findById(req.params.id);
    if (!mentee || mentee.role !== "mentee") {
      return res.status(404).json({ error: "Mentee not found" });
    }
    res.status(200).json(mentee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get mentors by expertise
export const getMentorsBySkill = async (req, res) => {
  try {
    const skill = req.query.skill;

    if (!skill) {
      return res.status(400).json({ error: "Skill parameter is required" });
    }

    const mentors = await User.find({
      role: "mentor",
      skills: skill,
    });

    if (mentors.length === 0) {
      return res
        .status(404)
        .json({ error: `No mentors found with the skill: ${skill}` });
    }

    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get mentors with high rating
export const getMentorsWithHighRating = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" })
      .sort({ rate: -1 })
      .limit(10);
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//find user by email
export const findUserByEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//for email address verification
export const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (
      user.verificationCode !== verificationCode ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// for email resend
export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    // console.log("kkkkkkkkkkk");
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 3600000; // 1 hour

    await user.save();
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL/TLS
      auth: {
        user: "mulukendemis44@gmail.com",
        pass: "jnko xwtx rcvd plgq", // Use your Gmail app password or account password
      },
    });

    // Define email options
    const mailOptions = {
      from: "mulukendemis44@gmail.com",
      to: email,
      subject: "Resend Verification Code",
      text: `Your new OTP(one time code)  is: ${verificationCode}`,
    };
    // Send the verification email
    await retryRequest(transporter.sendMail(mailOptions));
    // console.log("Email sent successfully");
    res
      .status(200)
      .json({ message: "Verification code resent. Please check your email." });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
//for login
export const loginController = async function (req, res) {
  const { email, phoneNumber, password } = req.body;
  // Extract password from request body

  try {
    // Find the user based on the phone number or email
    const user = await User.findOne({
      $or: [{ phoneNumber }, { email }],
    }).select("+password");
    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    // Compare the password with the hashed password
    const isPasswordValid = await user.comparePassword(password, user.password); // Use extracted password
    // Check if the password is correct
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    // console.log(token, user);
    // Send the token in the response
    res.status(200).json({
      isVerified: user.isVerified,
      _id: user._id,
      token,
      role: user.role,
      message: "successfully logged in",
      is_account_full_created: user.is_account_full_created,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
};

//TODO
// emails, token;

const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL/TLS
      auth: {
        user: "mulukendemis44@gmail.com",
        pass: "jnko xwtx rcvd plgq", // Use your Gmail app password or account password
      },
    });

    const mailOptions = {
      from: "mulukendemis44@gmail.com",
      to: email,
      subject: "Password reset",
      html: `<p>You have requested a password reset. Please follow <a href="http://localhost:3000/resetpassword/${token}">this link</a> to reset your password. This link will expire in 1 hour.</p>`, // Close the href attribute properly
    };

    await retryRequest(transporter.sendMail(mailOptions));
    // console.log("Password reset emails sent successfully");
  } catch (error) {
    console.error("Error sending password reset emails:", error);
    throw error;
  }
};

// Endpoint to initiate password reset
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a unique token
    const token = crypto.randomBytes(20).toString("hex");

    // Set token expiration time (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    // Save user with token
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(email, token);

    // Send success response
    return res
      .status(200)
      .json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error occurred while processing password reset:", error);
    return res.status(error.statusCode || 500).json({
      error:
        error.message || "An error occurred while processing password reset",
    });
  }
};

// Endpoint to reset password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // // Hash the new password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // // Update user's password and clear reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save updated user
    await user.save();

    // Send success response
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error occurred while resetting password:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while resetting password" });
  }
};

// Route to handle the reset password link
export const getResetPassword = async (req, res) => {
  const { token } = req.params;

  try {
    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Render a form for the user to reset their password
    // Here you can redirect the user to a password reset page or render a form
    // For example:
    // res.render('reset-password-form', { token }); // You need to create a reset-password-form.ejs file or use your preferred templating engine
    // Or you can redirect to a frontend route to handle the password reset process

    res.status(200).json({ message: "Redirect user to password reset page" }); // Adjust the response according to your frontend handling
  } catch (error) {
    console.error("Error occurred while handling password reset link:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while handling password reset link" });
  }
};
// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password field from the response
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get User by ID
export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(",mentorId", id);
    const user = await User.findById(id);
    // console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found " });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch User" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { updates } = req.body;
    const updateData = {};
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user data excluding the image fields
    Object.keys(updates).forEach((key) => {
      if (key !== "password") {
        updateData[key] = updates[key];
      }
    });

    // Upload and update image fields if provided
    if (updates.profileImage) {
      const isSameData = Object.keys(updates.profileImage).every(
        (key) => user.profileImage[key] === updates.profileImage[key]
      );
      if (!isSameData) {
        const profileImage = await uploadImageToCloudinary(
          updates.profileImage
        );
        updateData.profileImage = profileImage;
      } else {
        // console.log("Profile image is already the same.");
      }
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    // console.log(updateUser);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    // Send success response with updated user data
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};
//if it is not working , please remove retryrequest method
const uploadImageToCloudinary = async (imageData) => {
  // console.log(imageData);
  try {
    const result = await retryRequest(
      cloudinary.uploader.upload(imageData, {
        upload_preset: "profile",
      })
    );
    return { public_id: result.public_id, url: result.secure_url };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export const getMentorsByService = async (req, res) => {
  const { service } = req.query;

  try {
    let mentors;

    if (service === "Free") {
      mentors = await User.find({ role: "mentor", service: "Free" });
    } else if (service === "Paid") {
      mentors = await User.find({ role: "mentor", service: "Paid" });
    } else {
      mentors = await User.find({ role: "mentor" });
    }

    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//match mentors for mentor

export const matchMentors = async (req, res) => {
  const user_id = req.params.id;

  try {
    // Check if the user already exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { professionalRole, skills } = user;

    // Ensure skills is an array
    const skillsArray = Array.isArray(skills) ? skills : [skills];

    // Create a case-insensitive regular expression for professionalRole
    const professionalRoleRegex = new RegExp(
      professionalRole.split(" ").join("|"),
      "i"
    );

    // Query the database for mentors with the specified professional role and skills
    const mentors = await User.find({
      _id: { $ne: user_id }, // Exclude the request sender's data
      role: "mentor", // Filter mentors
      $or: [
        { professionalRole: professionalRoleRegex }, // Case-insensitive match for professional role using regex
        { skills: { $in: skillsArray } }, // Match any of the provided skills
      ],
    }).select("-password"); // Exclude password field from the results

    // console.log(mentors);
    res.status(200).json({ mentors }); // Return matching mentors
  } catch (error) {
    console.error("Error matching mentors:", error);
    res.status(500).json({ error: "An error occurred while matching mentors" });
  }
};

export const getMenteesOfSpecificMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    // console.log(mentorId);

    // Find the mentor by ID
    const mentor = await User.findById(mentorId);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Find the mentorship details for the mentor
    const mentorship = await Mentorship.findOne({ mentor: mentorId });

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship details not found" });
    }

    // Get the array of mentees from the mentorship model
    const mentees = mentorship.mentees;
    // console.log(mentees);

    // Initialize an empty array to store mentee details
    const menteeDetails = [];

    // Loop through mentees and find user by ID, then extract details
    for (const menteeId of mentees) {
      const mentee = await User.findById(menteeId);
      if (mentee) {
        menteeDetails.push({ _id: mentee._id, name: mentee.fullName });
      }
    }

    res.status(200).json(menteeDetails);
  } catch (error) {
    console.error("Error fetching mentees:", error);
    res.status(500).json({ error: "Failed to fetch mentees" });
  }
};

// Function to send password reset email
// const sendPasswordResetEmail = async (email, token) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true, // Use SSL/TLS
//       auth: {
//         user: "chilotnathnael@gmail.com",
//         pass: "wwgl ktvw dfmn cmwg", // Use your Gmail app password or account password
//       },
//     });
//search user using name and role
export const searchBasedNameAndRole = async (req, res) => {
  try {
    const { name, role } = req.query;

    // Constructing the query object based on provided parameters
    const query = {};
    if (name) query.fullName = { $regex: new RegExp(name, "i") }; // Case-insensitive search by name
    if (role) query.role = role;

    // Executing the search query
    const users = await User.find(query);

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found with the given criteria." });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get mentor by name,or professionalrole, or skills

export const searchMentors = async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from request parameters

    // Constructing the query object based on provided search query
    const searchCriteria = {
      role: "mentor",
      $or: [
        { fullName: { $regex: new RegExp(query, "i") } }, // Search by name
        { professionalRole: { $regex: new RegExp(query, "i") } }, // Search by professional role
        { skills: { $in: [new RegExp(query, "i")] } }, // Search by skills using $in operator
      ],
    };

    // Executing the search query
    const users = await User.find(searchCriteria);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to update password
export const updatePassword = async (req, res) => {
  // console.log(req.body);
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // console.log(userId);
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete User" });
  }
};
//Todo

//
export const approveMentor = async (req, res) => {
  try {
    const mentorId = req.params.id;
    // console.log("am inside mentor approve controller", mentorId);

    // Check if the mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    // Update the is_approved field to true
    const updatedMentor = await User.findByIdAndUpdate(
      mentorId,
      { is_approved: true },
      { new: true }
    );

    if (!updatedMentor) {
      return res.status(404).json({ error: "Failed to approve mentor" });
    }

    // Send success response with updated mentor data
    res.status(200).json(updatedMentor);
  } catch (error) {
    console.error("Error approving mentor:", error);
    res.status(500).json({ error: "Failed to approve mentor" });
  }
};

export const getUserByLimit = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).limit(3);
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
