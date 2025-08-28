
import Joi from 'joi';


export const registerSchema = Joi.object({
  name: Joi.string().min(2).required().label('Name'),

  email: Joi.string().email().required().label('Email'),

  password: Joi.string().min(6).required().label('Password'),

  mobile: Joi.string()
    .pattern(/^[0-9]{6,15}$/)
    .required()
    .label('Mobile number')
    .messages({
      'string.pattern.base': `"Mobile number" must be 6 to 15 digits`,
    }),

  companyName: Joi.string().min(2).required().label('Company Name'),

  country: Joi.object({
    label: Joi.string().min(2).required(),
    value: Joi.string().length(2).required(),
  }).required().label('Country'),
});




export const loginSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password'),
})



export const updateProfileSchema = Joi.object({
  // Basic Info
  name: Joi.string().min(2).optional(),

  // Company Info
  companyName: Joi.string().min(2).optional(),
  businessType: Joi.string().optional(),
  registrationNumber: Joi.string().optional(),

  // Country Info
  country: Joi.object({
    label: Joi.string().required(),
    value: Joi.string().required(),
  }).optional(),

  // Address
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pinCode: Joi.string().optional(),
  }).optional(),

  // Contact Person
  contactPerson: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    designation: Joi.string().optional(),
  }).optional(),

  // Documents (supporting multiple images)
  documents: Joi.object({
    businessRegistration: Joi.array().items(Joi.string().uri()).optional(),
    taxIdProof: Joi.array().items(Joi.string().uri()).optional(),
    addressProof: Joi.array().items(Joi.string().uri()).optional(),
    personalId: Joi.array().items(Joi.string().uri()).optional(),

    personalIdNumber: Joi.string().optional(),
    personalIdType: Joi.string().optional(),
    taxIdNumber: Joi.string().optional(), // GST/VAT/EIN etc.
  }).optional(),

  // Profile Picture
  profilePicture: Joi.string().uri().allow('').optional(),

  // Password Change
  password: Joi.string().min(6).optional(),
  currentPassword: Joi.when('password', {
    is: Joi.exist(),
    then: Joi.string().required().label('Current password'),
    otherwise: Joi.string().optional(),
  }),
});


