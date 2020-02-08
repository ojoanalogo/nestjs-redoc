import 'reflect-metadata';

import { INestApplication } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import {
  OpenAPIObject,
  SwaggerModule,
  DocumentBuilder
} from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { RedocModule } from './redoc-module';

describe('redoc-module', () => {
  let app: INestApplication;
  let swagger: OpenAPIObject;

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

    it('should run the setup (non-normalized path', async () => {
      expect(RedocModule.setup('some/path', app, swagger, {})).resolves.toBe(
        undefined
      );
    });
    it('should run the setup (normalized path', async () => {
      expect(RedocModule.setup('/some/path', app, swagger, {})).resolves.toBe(
        undefined
      );
    });
    it('shoudld be fine with the setup with logo options', async () => {
      expect(
        RedocModule.setup('some/path', app, swagger, {
          logo: {
            url: 'http://localhost:3333/test.png'
          }
        })
      ).resolves.toBe(undefined);
    });
    it('should server the documentation', async () => {
      swagger.info = {
        title: 'some title',
        version: '0.1'
      };
      await RedocModule.setup('/doc', app, swagger, {
        theme: {}
      });
      await app.init();
      await request(app.getHttpServer())
        .get('/doc')
        .expect(200);
      await request(app.getHttpServer())
        .get('/doc/swagger.json', (result) => console.log(result))
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
        // console.log(error);
        // expect(typeof error).toBe(TypeError);
        expect(error.message).toBe(
          '\"logo.url\" must be a valid uri'
        );
      }
    });
  });
});
