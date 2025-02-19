import { hasRef, isLocalRef } from '@stoplight/json';

import type {
  AvailableContext,
  Fragment,
  IdGenerator,
  RefResolver,
  TransformerContext,
  TranslateFunction,
} from './types';

export function createContext<T extends Record<string, unknown>>(
  document: T,
  resolveRef: RefResolver<T>,
  generateId: IdGenerator,
): TransformerContext<T> {
  let context: AvailableContext = 'service';
  return {
    document,
    get context() {
      return context;
    },
    set context(value) {
      context = value;
      if (value !== 'operation') {
        this.parentId = this.ids[value];
      }
    },
    maybeResolveLocalRef(target: unknown) {
      if (hasRef(target) && isLocalRef(target.$ref)) {
        try {
          return resolveRef.call(this, target);
        } catch {
          return target;
        }
      }

      return target;
    },
    generateId(value) {
      this.parentId = generateId(value);
      return this.parentId;
    },
    ids: {
      service: '',
      path: '',
      operation: '',
    },
    parentId: '',
  };
}

export function withContext<F extends TranslateFunction<any, any[]> = TranslateFunction<Fragment, unknown[]>>(
  fn: F,
): F {
  return <F>function (...args: Parameters<F>) {
    const { context, parentId } = this;
    const result = fn.apply(this, args);
    this.context = context;
    this.parentId = parentId;
    return result;
  };
}
