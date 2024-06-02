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
    interests: {
      type: String,
    },
    location: {
      state: { type: String },
      city: { type: String },
      region: { type: String },
      zipCode: { type: Number },
    },
    bank_account: {
      bank_name: { type: String },
      account_holder_name: { type: String },
      account_no: { type: String },
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    profileImage: {
      public_id: { type: String, default: Date.now() },
      url: { type: String, default: Date.now() },
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
    language: {
      type: [String],
      default: ["English"],
    },
    skill: {
      type: [String],
    },
    preferedExperianceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    role: {
      type: String,
      enum: ["mentor", "mentee"],
      default: "mentee",
    },
//collection of mentee in mentorship programs when confirmed by mentor will pushed to this array
    mentees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bio: {
      type: String,
    },
    goal: {
      type: String,
    },
    // professional role
    professionalRole: {
      type: String,
    },
    // currentJob: {
    //   type: String,
    // },
    educationalBackground: {
      school: { type: String },
      degree: { type: String },
      fieldOfStudy: { type: String },
      description: { type: String },
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
      },
    ],
    certification: {
      type: String,
    },
    rate: {
      type: Number,
    },
    mentoringFee: {
      type: Number,
    },
    //added for mentor remainingBalance for payment transafer calculations
    remainingBalance: {
      type: Number,
    },

    service: {
      type: String,
      default: "Free",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpires: Date,
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
    this.service = undefined;
    this.expertise = undefined;
    this.experience = undefined;
    this.mentoringFee = undefined;
    this.rate = undefined;
    this.currentJob = undefined;
    this.preferedExperianceLevel = undefined;
    this.bank_account = undefined;
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
