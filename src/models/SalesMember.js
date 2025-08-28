import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const phoneRegex = /^\d{10}$/;

const SalesMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
      match: [phoneRegex, 'Phone must be 10 digits'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    topLine: {
      type: Number,
      min: [0, 'Monthly Target must be ≥ 0'],
      default: null,
    },
    monthlyTarget: {
      type: Number,
      min: [0, 'Monthly Target must be ≥ 0'],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Normalize fields
SalesMemberSchema.pre('save', function (next) {
  if (this.isModified('email') && this.email) this.email = this.email.toLowerCase().trim();
  if (this.isModified('phone') && this.phone) this.phone = String(this.phone).trim();
  if (this.isModified('name') && this.name) this.name = this.name.trim();
  next();
});

// Hash password on create/update
SalesMemberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper to compare password
SalesMemberSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const SalesMember = mongoose.models.SalesMember || mongoose.model('SalesMember', SalesMemberSchema);
export default SalesMember;
