import 'reflect-metadata';

import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import {
  SwaggerDocument,
  SwaggerModule,
  DocumentBuilder
} from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { RedocModule } from './redoc-module';

describe('redoc-module', () => {
  let app: INestApplication;
  let swagger: SwaggerDocument;

  it('should be truthy', () => {
    expect(RedocModule).toBeTruthy();
  });

  describe('express app', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({}).compile();
      app = module.createNestApplication();
      const options = new DocumentBuilder()
        .setDescription('Test swagger Doc')
        .build();
      swagger = SwaggerModule.createDocument(app, options);
    });

    it('should run the setup (non-normalized path', () => {
      expect(RedocModule.setup('some/path', app, swagger, {})).toBe(undefined);
    });
    it('should run the setup (normalized path', () => {
      expect(RedocModule.setup('/some/path', app, swagger, {})).toBe(undefined);
    });
    it('shoudld be fine with the setup with logo options', () => {
      expect(
        RedocModule.setup('some/path', app, swagger, {
          logo: {
            url: 'http://localhost:3333/test.png'
          }
        })
      ).toBe(undefined);
    });
    it('should server the documentation', async () => {
      swagger.info = {title: 'some title'};
      RedocModule.setup('/doc', app, swagger, {
        theme: {},
      });
      await app.init();
      await request(app.getHttpServer())
        .get('/doc')
        .expect(200);
      await request(app.getHttpServer())
        .get('/doc/swagger.json')
        .expect(200);
      await app.close();
    });
  });

  describe('fastify app', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({}).compile();
      app = module.createNestApplication(new FastifyAdapter());
      const options = new DocumentBuilder()
        .setDescription('Test swagger Doc')
        .build();
      swagger = SwaggerModule.createDocument(app, options);
    });

    it('should throw an error for now', async () => {
      try {
        await RedocModule.setup('some/path', app, swagger, {});
      } catch (error) {
        expect(error.message).toBe('Fastify is not implemented yet');
      }
    });
  });

  describe('weird error', () => {
    beforeEach(async () => {
      const module = await Test.createTestingModule({}).compile();
      app = module.createNestApplication({
        initHttpServer: jest.fn(),
        getHttpServer: jest.fn()
      } as any);
      const options = new DocumentBuilder()
        .setDescription('Test swagger Doc')
        .build();
      swagger = SwaggerModule.createDocument(app, options);
    });

    it('should throw an error for now', async () => {
      try {
        await RedocModule.setup('some/path', app, swagger, {
          logo: { url: 'notaUrl' }
        });
      } catch (error) {
        expect(typeof error).toBe(TypeError);
        expect(error.message).toBe(
          'ValidationError: child "logo" fails because [child "url" fails because ["url" must be a valid uri]]'
        );
      }
    });
  });
});
