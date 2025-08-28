// src/validators/orderValidator.js
import Joi from 'joi';

export const createOrderSchema = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        qty: Joi.number().min(1).required(),
        image: Joi.string().uri().required(),
        price: Joi.number().min(0).required(),
        product: Joi.string().required(), // should be a MongoDB ObjectId string
      })
    )
    .min(1)
    .required(),

  shippingAddress: Joi.object({
    companyName: Joi.string().optional().allow('', null),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),

  paymentMethod: Joi.string().required(),

  itemsPrice: Joi.number().min(0).required(),
  shippingPrice: Joi.number().min(0).required(),
  taxPrice: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),

  status: Joi.string()
    .valid('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Dispatched')
    .optional(),

  notes: Joi.string().optional().allow('', null),
  internalNotes: Joi.string().optional().allow('', null),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Dispatched')
    .required(),
});



export const updateOrderByIdSchema = Joi.object({
  status: Joi.string().valid('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Dispatched').optional(),
  paymentStatus: Joi.string().valid('Pending', 'Verified', 'Paid', 'Failed', 'QuoteRequested').optional(),
  paymentMethod: Joi.string().valid('NEFT', 'ONLINE', 'COD', 'QUOTE', 'PURCHASE_ORDER').optional(),
  deliveryMethod: Joi.string().valid('domestic', 'export').optional(),

  billingAddress: Joi.object({
    street: Joi.string().allow('', null).optional(),
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    pinCode: Joi.string().allow('', null).optional(),
    gstNumber: Joi.string().allow('', null).optional(), // ✅ Include GST field
    country: Joi.alternatives().try(
      Joi.object({
        label: Joi.string().required(),
        value: Joi.string().required()
      }),
      Joi.string()
    ).optional()
  }).optional(),

  shippingAddress: Joi.object({
    street: Joi.string().allow('', null).optional(),
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    pinCode: Joi.string().allow('', null).optional(),
    gstNumber: Joi.string().allow('', null).optional(),
    country: Joi.alternatives().try(
      Joi.object({
        label: Joi.string().required(),
        value: Joi.string().required()
      }),
      Joi.string()
    ).optional()
  }).optional(),

  utrProof: Joi.string().allow('', null).optional(),
  poDocument: Joi.string().allow('', null).optional(),
  note: Joi.string().allow('', null).optional(),
  adminNote: Joi.string().allow('', null).optional()
});
