import { HttpServer, INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerDocument } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { join } from 'path';
import { LogoOptions, RedocDocument, RedocOptions } from './interfaces';
import Joi = require('@hapi/joi');
import exphbs = require('express-handlebars');

export class RedocModule {

  /**
   * Setup ReDoc frontend
   * @param path - path to mount the ReDoc frontend
   * @param app - NestApplication
   * @param document - Swagger document object
   * @param options - Init options
   */
  public static setup(path: string, app: INestApplication, document: SwaggerDocument, options: RedocOptions) {
    // Validate options object
    this.validateOptionsObject(options, document).then((_options) => {
      const redocDocument = this.addVendorExtensions(_options, <RedocDocument>document);
      const httpAdapter: HttpServer = app.getHttpAdapter();
      if (httpAdapter && httpAdapter.constructor && httpAdapter.constructor.name === 'FastifyAdapter') {
        return this.setupFastify();
      }
      return this.setupExpress(path, <NestExpressApplication>app, redocDocument, _options);
    }, (err) => {
      // oh ohh, something bad happened
      throw new TypeError(err);
    });
  }

  private static setupFastify() {
    // throw new NotImplementedException('Fastify is not implemented yet');
  }

  private static validateOptionsObject(options: RedocOptions, document: SwaggerDocument): Joi.ValidationResult<RedocOptions> {
    const schema = Joi.object().keys({
      title: Joi.string().optional().default((document.info ? document.info.title : 'Swagger documentation')),
      logo: {
        url: Joi.string().optional().uri(),
        backgroundColor: Joi.string().optional().regex(new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')),
        altText: Joi.string().optional(),
        href: Joi.string().optional().uri()
      },
      theme: Joi.any().default(undefined),
      untrustedSpec: Joi.boolean().optional().default(false),
      supressWarnings: Joi.boolean().optional().default(true),
      hideHostname: Joi.boolean().optional().default(false),
      expandResponses: Joi.string().optional(),
      requiredPropsFirst: Joi.boolean().optional().default(true),
      sortPropsAlphabetically: Joi.boolean().optional().default(true),
      showExtensions: Joi.any().optional().default(false),
      noAutoAuth: Joi.boolean().optional().default(true),
      pathInMiddlePanel: Joi.boolean().optional().default(false),
      hideLoading: Joi.boolean().optional().default(false),
      nativeScrollbars: Joi.boolean().optional().default(false),
      hideDownloadButton: Joi.boolean().optional().default(false),
      disableSearch: Joi.boolean().optional().default(false),
      onlyRequiredInSamples: Joi.boolean().optional().default(false)
    });
    return schema.validate(options);
  }

  /**
   * Setup ReDoc frontend for express plattform
   * @param path - path to mount the ReDoc frontend
   * @param app - NestApplication
   * @param document - ReDoc document object
   * @param options - Init options
   */
  private static setupExpress(path: string, app: NestExpressApplication, document: RedocDocument, options: RedocOptions) {
    // Normalize URL path to use
    const finalPath = this.normalizePath(path);
    // Serve swagger spec in another URL appended to the normalized path
    const swaggerDocUrl = join(finalPath, 'swagger.json');
    const hbs = exphbs.create({
      helpers: {
        toJSON: function (object: any) {
          return JSON.stringify(object);
        }
      }
    });
    // Set app to use handlebars as engine
    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');
    // Set views folder
    app.set('views', join(__dirname, '..', 'views'));
    // Serve ReDoc Frontend
    app.getHttpAdapter().get(finalPath, (req: Request, res: Response) => {
      const { title, theme, logo, ...otherOptions } = options;
      const renderData = {
        data: {
          title: title,
          docUrl: swaggerDocUrl,
          options: otherOptions,
          ...(theme && {
            theme: {
              ...theme
            }
          })
        }
      };
      res.render('redoc', {
        /** Tell handlebars to not use a main layout */
        layout: false,
        debug: renderData,
        ...renderData
      });
    });
    // Serve swagger spec json
    app.getHttpAdapter().get(swaggerDocUrl, (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(document);
    });
  }

  private static normalizePath(path: string) {
    return path.charAt(0) !== '/' ? '/' + path : path;
  }

  private static addVendorExtensions(options: RedocOptions, document: RedocDocument) {
    if (options.logo) {
      const logoOption: Partial<LogoOptions> = { ...options.logo };
      document.info['x-logo'] = logoOption;
    }
    return document;
  }
}
