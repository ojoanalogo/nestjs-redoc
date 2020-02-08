import { HttpServer, INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { OpenAPIObject } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { join } from 'path';
import { LogoOptions, RedocDocument, RedocOptions } from './interfaces';
import { schema } from './model/options.model';
import handlebars = require('express-handlebars');

export class RedocModule {
  /**
   * Setup ReDoc frontend
   * @param path - path to mount the ReDoc frontend
   * @param app - NestApplication
   * @param document - Swagger document object
   * @param options - Init options
   */
  public static async setup(
    path: string,
    app: INestApplication,
    document: OpenAPIObject,
    options: RedocOptions
  ): Promise<void> {
    // Validate options object
    try {
      const _options = await this.validateOptionsObject(options, document);
      const redocDocument = this.addVendorExtensions(_options, <RedocDocument>(
        document
      ));
      const httpAdapter: HttpServer = app.getHttpAdapter();
      if (
        httpAdapter &&
        httpAdapter.constructor &&
        httpAdapter.constructor.name === 'FastifyAdapter'
      ) {
        return this.setupFastify();
      }
      return this.setupExpress(
        path,
        <NestExpressApplication>app,
        redocDocument,
        _options
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Setup fastify (not implemented yet)
   */
  private static async setupFastify(): Promise<void> {
    throw new Error('Fastify is not implemented yet');
  }

  private static async validateOptionsObject(
    options: RedocOptions,
    document: OpenAPIObject
  ): Promise<RedocOptions> {
    try {
      return schema(document).validateAsync(options) as RedocOptions;
    } catch (error) {
      // Something went wrong while parsing config object
      throw new TypeError(error.message);
    }
  }

  /**
   * Setup ReDoc frontend for express plattform
   * @param path - path to mount the ReDoc frontend
   * @param app - NestApplication
   * @param document - ReDoc document object
   * @param options - Init options
   */
  private static setupExpress(
    path: string,
    app: NestExpressApplication,
    document: RedocDocument,
    options: RedocOptions
  ) {
    // Normalize URL path to use
    const finalPath = this.normalizePath(path);
    // Serve swagger spec in another URL appended to the normalized path
    const swaggerDocUrl = join(finalPath, 'swagger.json');
    const hbs = handlebars.create({
      helpers: {
        toJSON: function(object: any) {
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

  /**
   * Normalize path string
   * @param path - Path string
   */
  private static normalizePath(path: string): string {
    return path.charAt(0) !== '/' ? '/' + path : path;
  }

  /**
   * Add any vendor options if they are present in the options object
   * @param options options object
   * @param document redoc document
   */
  private static addVendorExtensions(
    options: RedocOptions,
    document: RedocDocument
  ): RedocDocument {
    if (options.logo) {
      const logoOption: Partial<LogoOptions> = { ...options.logo };
      document.info['x-logo'] = logoOption;
    }
    return document;
  }
}
