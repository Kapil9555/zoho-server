import Joi from 'joi';

// 24‑char hex for Mongo ObjectId
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId');

const keyValueArraySchema = Joi.array().items(
  Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
  })
);

const licenseSchema = Joi.object({
  mode: Joi.string().valid('none', 'seats', 'keys').default('none'),
  isLimited: Joi.boolean().default(false),
  availableSeats: Joi.number().integer().min(0).default(0),
  keysPool: Joi.array().items(Joi.string().trim()).default([]),
  assignedKeys: Joi.array().items(
    Joi.object({
      key: Joi.string().trim().required(),
      orderId: objectId.optional(),
      userId: objectId.optional(),
      assignedAt: Joi.date().optional(),
    })
  ).optional()
}).custom((val, helpers) => {
  if (val.mode === 'seats' && val.isLimited && (!Number.isInteger(val.availableSeats) || val.availableSeats <= 0)) {
    return helpers.error('any.custom', { message: 'availableSeats must be > 0 when mode=seats and isLimited=true' });
  }
  if (val.mode === 'keys' && !Array.isArray(val.keysPool)) {
    return helpers.error('any.custom', { message: 'keysPool must be an array when mode=keys' });
  }
  return val;
}, 'license logic');

export const productSchema = Joi.object({
  type: Joi.string().valid('hardware', 'software').required(),
  category: objectId.required(),
  subcategory: objectId.allow(null, '').optional(),

  name: Joi.string().trim().required(),
  description: Joi.string().allow('', null).optional(),

  brand: Joi.string().allow('', null).optional(),
  oem: Joi.string().allow('', null).optional(),
  modelNumber: Joi.string().allow('', null).optional(),
  mfrPartNumber: Joi.string().allow('', null).optional(),
  ourPartNumber: Joi.string().allow('', null).optional(),

  mrp: Joi.number().positive().required(),
  srp: Joi.number().positive().required(),
  discountPercent: Joi.number().min(0).max(100).default(0),
  moq: Joi.number().integer().min(1).default(1),
  bulkPricing: Joi.array().items(
    Joi.object({
      minQty: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required(),
    })
  ).optional(),
  unit: Joi.string().trim().default('piece'),
  hsnCode: Joi.string().allow('', null).optional(),
  gst: Joi.number().min(0).max(28).required(), 

  stock: Joi.when('type', {
    is: 'hardware',
    then: Joi.number().integer().min(0).required(),
    otherwise: Joi.number().integer().min(0).default(0),
  }),

  warranty: Joi.string().allow('', null).optional(),
  warrantyType: Joi.string().valid('standard', 'oem', 'extended').optional(),
  deliveryMethod: Joi.string().allow('', null).optional(),

  licenseType: Joi.string().allow('', null).optional(),
  license: licenseSchema.optional(),

  duration: Joi.string().allow('', null).optional(),
  platform: Joi.string().allow('', null).optional(),
  features: Joi.array().items(Joi.string().trim()).optional(),
  oemNotes: Joi.string().allow('', null).optional(),

  specifications: keyValueArraySchema.optional(),
  featureHighlights: keyValueArraySchema.optional(),

  images: Joi.array().items(Joi.string()).optional(),

  status: Joi.string().valid('Active', 'Inactive').optional(),
  sku: Joi.string().trim().optional(),
}).prefs({ abortEarly: false });

export const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('', null).optional(),
}).prefs({ abortEarly: false });

export const validateProductPrices = (req, res, next) => {
  const { mrp, srp } = req.body;
  if (Number(srp) > Number(mrp)) {
    res.status(400);
    throw new Error('Selling price (SRP) cannot be greater than MRP');
  }
  next();
};

// Optional: sanitize legacy UI fields if they sneak in
export const preprocessProductBody = (req, _res, next) => {
  // map legacy licenseMode → license.mode
  if (req.body.licenseMode) {
    req.body.license = req.body.license || {};
    req.body.license.mode = req.body.licenseMode;
  }
  delete req.body.licenseMode;
  delete req.body.licenseIsLimited;
  delete req.body.licenseAvailableSeats;
  delete req.body.licenseKeysToAdd;

  // drop front-end only fields not in model
  delete req.body.isFeatured;

  // normalize empty subcategory to null
  if (req.body.subcategory === '') req.body.subcategory = null;

  next();
};
