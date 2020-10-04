'use strict';

const Joi = require('joi');

exports.townSchema = Joi.object().keys({
  id: Joi.string().alphanum().min(1).max(3).required(),
  name: Joi.string().min(2).max(30).required(),
});

exports.pathSchema = Joi.object().keys({
  start: Joi.string().alphanum().min(1).max(3).required(),
  end: Joi.string().alphanum().min(1).max(3).required(),
  cost: Joi.number().strict().positive().greater(0),
});
