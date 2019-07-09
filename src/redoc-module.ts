import { HttpServer, INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerDocument } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { join } from 'path';
import { RedocOptions } from './interfaces';
import exphbs = require('express-handlebars');

export class RedocModule {

  public static setup(url: string, app: INestApplication, document: SwaggerDocument, options: RedocOptions) {
    const httpAdapter: HttpServer = app.getHttpAdapter();
    if (httpAdapter && httpAdapter.constructor && httpAdapter.constructor.name === 'FastifyAdapter') {
      return this.setupFastify();
    }
    return this.setupExpress(url, <NestExpressApplication>app, document, options);
  }

  private static setupFastify() {
    // throw new NotImplementedException('Fastify is not implemented yet');
  }

  private static setupExpress(url: string, app: NestExpressApplication, document: SwaggerDocument, options: RedocOptions) {
    const finalPath = this.normalizePath(url);
    const swaggerDocUrl = join(finalPath, 'swagger.json');
    const { title } = options;
    app.engine('handlebars', exphbs());
    app.set('view engine', 'handlebars');
    app.set('views', join(__dirname, '..', 'views'));
    app.getHttpAdapter().get(finalPath, (req: Request, res: Response) => {
      res.render('redoc', {
        layout: false,
        data: {
          title: title,
          url: swaggerDocUrl
        }
      });
    });
    app.getHttpAdapter().get(swaggerDocUrl, (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(document);
    });
  }

  private static normalizePath(path: string) {
    return path.charAt(0) !== '/' ? '/' + path : path;
  }
}
