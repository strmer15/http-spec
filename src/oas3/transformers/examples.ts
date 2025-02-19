import { isPlainObject } from '@stoplight/json';
import { INodeExample, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { withContext } from '../../context';
import { isString } from '../../guards';
import { getSharedKey } from '../../oas/resolver';
import type { ArrayCallbackParameters } from '../../types';
import type { Oas3TranslateFunction } from '../types';

export const translateToExample = withContext<
  Oas3TranslateFunction<ArrayCallbackParameters<[key: string, example: unknown]>, Optional<INodeExample>>
>(function ([key, example]) {
  const resolvedExample = this.maybeResolveLocalRef(example);

  if (!isPlainObject(resolvedExample)) return;

  const actualKey = this.context === 'service' ? getSharedKey(resolvedExample) : key;

  return {
    id: this.generateId(`example-${this.parentId}-${actualKey}`),
    value: resolvedExample.value,
    key,

    ...pickBy(
      {
        summary: resolvedExample.summary,
        description: resolvedExample.description,
      },
      isString,
    ),
  };
});
