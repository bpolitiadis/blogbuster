import mongoose, { Schema, Document, Model, CallbackError } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  xp: number;
  level: number;
  badges: string[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  addXP(amount: number): Promise<void>;
  checkAndAwardBadges(): Promise<void>;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [20, "Username cannot exceed 20 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  xp: {
    type: Number,
    default: 0,
    min: 0,
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  badges: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add XP and update level
UserSchema.methods.addXP = async function (amount: number): Promise<void> {
  this.xp += amount;

  // Calculate new level (every 100 XP = 1 level)
  const newLevel = Math.floor(this.xp / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
  }

  await this.save();
  await this.checkAndAwardBadges();
};

// Method to check and award badges based on XP and achievements
UserSchema.methods.checkAndAwardBadges = async function (): Promise<void> {
  const badges = new Set(this.badges);

  // XP-based badges
  if (this.xp >= 1000 && !badges.has("XP Master")) {
    badges.add("XP Master");
  }
  if (this.xp >= 5000 && !badges.has("XP Legend")) {
    badges.add("XP Legend");
  }

  // Level-based badges
  if (this.level >= 5 && !badges.has("Rising Star")) {
    badges.add("Rising Star");
  }
  if (this.level >= 10 && !badges.has("Veteran")) {
    badges.add("Veteran");
  }

  this.badges = Array.from(badges);
  await this.save();
};

// Create the model or use existing one
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
