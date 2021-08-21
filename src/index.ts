import 'reflect-metadata';
import { config } from 'dotenv';

config();

export { Configuration } from './configuration';
export { InjectEnvOptions, InjectEnv } from './inject-env';
export { EnvError, InvalidEnvError, RequiredEnvError } from './errors';
