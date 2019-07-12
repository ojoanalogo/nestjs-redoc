import { SwaggerDocument } from '@nestjs/swagger';
import { LogoOptions } from './redoc_options.interface';

export interface RedocDocument extends Partial<SwaggerDocument> {
  info: SwaggerDocument['info'] & {
    'x-logo'?: LogoOptions;
  };
}
