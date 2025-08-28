import mongoose from "mongoose";
import bcrypt from "bcryptjs";

//  Address Sub-Schema
const primaryAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
}, { _id: false });

// Saved addresses (with label)
const savedAddressSchema = new mongoose.Schema({
  label: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  country: {
    label: { type: String, required: true },  // e.g., "India", "United States"
    value: { type: String, required: true },  // e.g., "IN", "US"
  }
}, { _id: true });

// Contact Person Sub-Schema
const contactPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, default: null },
  phone: { type: String, default: null },
  email: { type: String, default: null },
}, { _id: false });


//  Documents Sub-Schema (International)
const documentSchema = new mongoose.Schema({
  businessRegistration: { type: [String], default: [] },   // Can hold multiple files
  taxIdProof: { type: [String], default: [] },   // e.g., GST/VAT document images
  addressProof: { type: [String], default: [] },   // Utility bills, rental agreements etc.
  personalId: { type: [String], default: [] },   // Aadhaar, Passport, etc.

  personalIdNumber: { type: String, default: null },   // Number for the ID
  personalIdType: { type: String, default: null },   // Aadhaar, SSN, NIN, etc.
  taxIdNumber: { type: String, default: null },   // GST, VAT, EIN etc.
}, { _id: false });

// Main User Schema
const userSchema = new mongoose.Schema({
  //  Basic Info
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{6,15}$/,
  },
  customerId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  profilePicture: { type: String, default: null },

  //  Role & Admin
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['admin', 'buyer'], default: 'buyer' },

  //  Company Info
  companyName: { type: String, required: true },
  businessType: { type: String, default: null },
  registrationNumber: { type: String, default: null },
  //  taxIdNumber moved to documents.taxIdNumber for flexibility

  //  Country Info (for dropdown support)
  country: {
    label: { type: String, required: true },  // e.g., "India", "United States"
    value: { type: String, required: true },  // e.g., "IN", "US"
  },

  // Address & Contact Person
  address: primaryAddressSchema,
  addresses: [savedAddressSchema],
  contactPerson: contactPersonSchema,

  // 👉 KYC Document Uploads
  documents: documentSchema,
  
  isDeleted: {
    type: Boolean,
    default: false,
  },

  // KYC Status & Review
  kycStatus: {
    type: String,
    enum: ["not_submitted", "pending", "approved", "rejected"],
    default: 'not_submitted',
  },
  rejectionReason: { type: String, default: null },
  kycReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  kycReviewedAt: { type: Date, default: null },

  // 👉 Verification Flags
  isEmailVerified: { type: Boolean, default: false },
  isMobileVerified: { type: Boolean, default: false },

  //  Business Logic
  specialDiscount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });


//  Password Encryption Middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//  Password Comparison Method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
