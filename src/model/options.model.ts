import Joi = require('@hapi/joi');
import { OpenAPIObject } from '@nestjs/swagger';

export const schema = (document: OpenAPIObject) =>
  Joi.object().keys({
    title: Joi.string()
      .optional()
      .default(document.info ? document.info.title : 'Swagger documentation'),
    logo: {
      url: Joi.string()
        .optional()
        .uri(),
      backgroundColor: Joi.string()
        .optional()
        .regex(new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')),
      altText: Joi.string().optional(),
      href: Joi.string()
        .optional()
        .uri()
    },
    theme: Joi.any(),
    untrustedSpec: Joi.boolean()
      .optional()
      .default(false),
    supressWarnings: Joi.boolean()
      .optional()
      .default(true),
    hideHostname: Joi.boolean()
      .optional()
      .default(false),
    expandResponses: Joi.string().optional(),
    requiredPropsFirst: Joi.boolean()
      .optional()
      .default(true),
    sortPropsAlphabetically: Joi.boolean()
      .optional()
      .default(true),
    showExtensions: Joi.any()
      .optional()
      .default(false),
    noAutoAuth: Joi.boolean()
      .optional()
      .default(true),
    pathInMiddlePanel: Joi.boolean()
      .optional()
      .default(false),
    hideLoading: Joi.boolean()
      .optional()
      .default(false),
    nativeScrollbars: Joi.boolean()
      .optional()
      .default(false),
    hideDownloadButton: Joi.boolean()
      .optional()
      .default(false),
    disableSearch: Joi.boolean()
      .optional()
      .default(false),
    onlyRequiredInSamples: Joi.boolean()
      .optional()
      .default(false)
  });
