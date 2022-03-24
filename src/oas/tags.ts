import { isPlainObject } from '@stoplight/json';
import type { INodeTag, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { isNonNullable, isSerializablePrimitive, isString } from '../guards';
import type { ArrayCallbackParameters, Fragment, TranslateFunction } from '../types';

export const translateTag: TranslateFunction<
  Fragment,
  ArrayCallbackParameters<unknown>,
  Optional<INodeTag>
> = function (tag) {
  if (tag === null || !isSerializablePrimitive(tag)) return;

  return {
    name: String(tag),
  };
};

export const translateTagDefinition: TranslateFunction<
  Fragment,
  ArrayCallbackParameters<unknown>,
  Optional<INodeTag>
> = function (tag, ...params) {
  if (!isPlainObject(tag)) return;

  const translatedTag = translateTag.call(this, tag.name, ...params);

  if (!translatedTag) return;

  return {
    ...translatedTag,

    ...pickBy(
      {
        description: tag.description,
      },
      isString,
    ),
  };
};

export const translateToTags: TranslateFunction<Fragment, [tags: unknown], INodeTag[]> = function (tags) {
  return Array.isArray(tags) ? tags.map(translateTag, this).filter(isNonNullable) : [];
};
