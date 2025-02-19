import * as fs from 'fs';
import * as path from 'path';

import { transformOas3Operations } from '../operation';
import { transformOas3Service } from '../service';

test('should generate proper ids', async () => {
  const document = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../__fixtures__/id.json'), 'utf8'));
  const { default: output } = await import('../__fixtures__/output');

  expect([transformOas3Service({ document }), ...transformOas3Operations(document)]).toEqual(output);
});
