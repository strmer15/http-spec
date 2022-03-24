import { DeepPartial, HttpParamStyles, IHttpHeaderParam } from '@stoplight/types';
import { Operation, Schema, Spec } from 'swagger-schema-official';

import { createContext } from '../../../context';
import { translateToHeaderParams } from '../params';
import { translateToResponses as _translateToResponses } from '../responses';

jest.mock('../params');

const translateToResponses = (document: DeepPartial<Spec>, responses: DeepPartial<Operation['responses']>) =>
  _translateToResponses.call(createContext(document), { responses });

describe('responses', () => {
  const fakeHeaderParams: IHttpHeaderParam[] = [{ name: 'fake-header', style: HttpParamStyles.Simple }];
  const produces = ['application/json', 'application/xml'];

  beforeEach(() => {
    (translateToHeaderParams as jest.Mock).mockReturnValue(fakeHeaderParams);
  });

  it('should translate to multiple responses', () => {
    const responses = translateToResponses(
      { produces },
      {
        r1: {
          description: 'd1',
          examples: {
            'application/json': {},
          },
          headers: {},
          schema: {},
        },
        r2: {
          description: 'd2',
          examples: {
            'application/xml': {},
          },
          headers: {},
          schema: {},
        },
      },
    );

    expect(responses).toMatchSnapshot();
  });

  it('should translate to response w/o headers', () => {
    expect(
      translateToResponses(
        { produces },
        {
          r1: {
            description: 'd1',
            examples: {
              'application/xml': {},
            },
            schema: {},
          },
        },
      ),
    ).toMatchSnapshot();
  });

  it('should translate to response w/o examples', () => {
    expect(
      translateToResponses(
        { produces },
        {
          r1: {
            description: 'd1',
            schema: {},
          },
        },
      ),
    ).toMatchSnapshot();
  });

  describe('should keep foreign examples', () => {
    it('aggregating them to the first example', () => {
      const responses = translateToResponses(
        { produces },
        {
          r1: {
            description: 'd1',
            examples: {
              'application/i-have-no-clue': {},
              'application/json': {},
            },
            headers: {},
            schema: {},
          },
        },
      );

      expect(responses[0].contents).toBeDefined();
      expect(responses[0].contents![0]).toHaveProperty('mediaType', 'application/json');

      expect(responses[0].contents![0].examples).toBeDefined();
      expect(responses[0].contents![0].examples).toHaveLength(2);
    });
  });

  describe('schema examples', () => {
    describe('given a response with a schema with an example', () => {
      it('should translate to response with examples', () => {
        const responses = translateToResponses(
          { produces },
          {
            r1: {
              description: 'd1',
              headers: {},
              schema: {
                example: {
                  name: 'value',
                },
              },
            },
          },
        );
        expect(responses[0].contents![0]).toHaveProperty('examples', [{ key: 'default', value: { name: 'value' } }]);
      });
    });

    describe('given multiple schema example properties', () => {
      it('should translate all examples', () => {
        const responses = translateToResponses(
          { produces },
          {
            r1: {
              description: 'd1',
              headers: {},
              schema: {
                example: {
                  name: 'example value',
                },
                ['x-examples']: {
                  'application/json': {
                    name: 'examples value',
                  },
                },
              } as Schema,
            },
          },
        );
        expect(responses[0].contents![0]).toHaveProperty('examples', [
          { key: 'application/json', value: { name: 'examples value' } },
          { key: 'default', value: { name: 'example value' } },
        ]);
      });
    });

    describe('given response with examples in root and schema objects', () => {
      it('root examples should take precedence over schema examples', () => {
        const responses = translateToResponses(
          { produces },
          {
            r1: {
              description: 'd1',
              headers: {},
              examples: {
                'application/i-have-no-clue': {},
                'application/json': {},
              },
              schema: {
                example: {
                  name: 'value',
                },
              },
            },
          },
        );
        expect(responses[0].contents![0].examples).toHaveLength(2);
        expect(responses[0].contents![0].examples).toEqual([
          { key: 'application/json', value: {} },
          { key: 'application/i-have-no-clue', value: {} },
        ]);
      });
    });
  });
});
