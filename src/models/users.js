import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },

    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    location: {
      state: { type: String },
      city: { type: String },
      region: { type: String },
      zipCode: { type: Number },
    },
    bank_account: [
      {
        bank_name: { type: String },
        account_holder_name: { type: String },
        account_no: { type: String },
      },
    ],
    level: {
      type: String,
    },
    profileImage: {
      public_id: { type: String },
      url: { type: String },
    },
    is_account_full_created: {
      type: Boolean,
      default: false,
    },
    is_approved: {
      type: Boolean,
      default: false,
    },
    agreeTerms: {
      type: Boolean,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    languages: {
      type: [String],
      default: ["English"],
    },
    skills: {
      type: [String],
    },
    mentorships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentorship",
      },
    ],
    role: {
      type: String,
      enum: ["mentor", "mentee", "admin"],
    },

    bio: {
      type: String,
    },
    goal: {
      type: String,
    },
    professionalRole: {
      type: String,
    },
    experiences: [
      {
        title: { type: String },
        company: { type: String },
        isCurrent: { type: Boolean },
        experienceDescription: { type: String },
      },
    ],

    educations: [
      {
        school: { type: String },
        degree: { type: String },
        field: { type: String },
        educationDescription: { type: String },
        certification: {
          type: String,
        },
      },
    ],
    category: {
      type: String,
    },
    rate: {
      type: Number,
      default: 0,
    },
    no_review: {
      type: Number,
      default: 0,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },

    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
  },
  { timestamps: true }
);
// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip hashing if password isn't modified
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
});
// Instance method to compare password during login
userSchema.methods.comparePassword = async function (
  candidatePassword,
  password
) {
  return await bcrypt.compare(candidatePassword, password);
};

userSchema.pre("save", function (next) {
  if (this.role !== "mentor") {
    this.is_approved = undefined; // Remove field if not mentor
    this.experiences = undefined;
    this.level = undefined;
    this.goal = undefined;
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
