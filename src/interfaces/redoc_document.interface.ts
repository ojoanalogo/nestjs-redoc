import { OpenAPIObject } from '@nestjs/swagger';
import { LogoOptions } from './redoc_options.interface';

export interface RedocDocument extends Partial<OpenAPIObject> {
  info: OpenAPIObject['info'] & {
    'x-logo'?: LogoOptions;
  };
}
