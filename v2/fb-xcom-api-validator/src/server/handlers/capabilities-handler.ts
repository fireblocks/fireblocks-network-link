import logger from '../../logging';

const log = logger('handler:capabilities');
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function handleGetCapabilities(): Promise<string> {
  log.info('GetCapabilities');
  return 'Vigilo Confido';
}
