import { DeepPartial } from '@stoplight/types';
import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

import { transformOas2Operation, transformOas2Operations } from '../operation';

describe('transformOas2Operation', () => {
  it('should translate operation', () => {
    const document: Partial<Spec> = {
      swagger: '2.0',
      info: {
        title: 'title',
        version: '1.0',
      },
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'oid',
            description: 'odesc',
            deprecated: true,
            summary: 'osum',
            responses: {
              response: {
                description: 'desc',
                examples: {
                  example: {},
                },
                headers: {
                  header: {
                    type: 'integer',
                  },
                },
                schema: {},
              },
            },
            security: [
              {
                petstore_auth: ['write:pets'],
              },
              {
                api_key: [],
              },
            ],
          },
        },
      },
      securityDefinitions: {
        petstore_auth: {
          type: 'oauth2',
          authorizationUrl: 'https://petstore.swagger.io/oauth/dialog',
          flow: 'implicit',
          scopes: {
            'write:pets': 'modify pets in your account',
            'read:pets': 'read your pets',
          },
        },
        api_key: {
          type: 'apiKey',
          name: 'api_key_name',
          in: 'header',
        },
      },
    };

    expect(
      transformOas2Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toMatchSnapshot({
      id: expect.any(String),
      responses: [
        {
          id: expect.any(String),
          contents: [
            {
              id: expect.any(String),
              examples: [
                {
                  id: expect.any(String),
                },
              ],
            },
          ],
          headers: [
            {
              id: expect.any(String),
              schema: {
                'x-stoplight': {
                  id: expect.any(String),
                },
              },
            },
          ],
        },
      ],
      security: [
        [
          {
            id: expect.any(String),
          },
        ],
        [
          {
            id: expect.any(String),
          },
        ],
      ],
    });
  });

  it('should properly translate operation with no response body', () => {
    const document: Partial<Spec> = {
      swagger: '2.0',
      info: {
        title: 'title',
        version: '1.0',
      },
      produces: ['application/json'],
      paths: {
        '/users/{userId}': {
          delete: {
            operationId: 'oid',
            description: 'odesc',
            summary: 'osum',
            responses: {
              '204': {
                description: 'Some description',
              },
            },
          },
        },
      },
    };

    const result = transformOas2Operation({
      path: '/users/{userId}',
      method: 'delete',
      document,
    });

    expect(result.responses[0].contents).toHaveLength(0);
  });

  it('should return deprecated property in http operation root', () => {
    const document: DeepPartial<Spec> = {
      swagger: '2.0',
      paths: {
        '/users/{userId}': {
          get: {
            deprecated: true,
          },
        },
      },
    };

    expect(
      transformOas2Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toHaveProperty('deprecated', true);
  });

  it('should return x-internal property in http operation root', () => {
    const document: DeepPartial<Spec & { paths: any }> = {
      swagger: '2.0',
      paths: {
        '/users/{userId}': {
          get: {
            'x-internal': true,
          },
          post: {
            'x-internal': false,
          },
          put: {},
        },
      },
    };

    expect(transformOas2Operations(document as any)).toStrictEqual([
      expect.objectContaining({
        path: '/users/{userId}',
        method: 'get',
        internal: true,
        extensions: {},
      }),
      expect.objectContaining({
        path: '/users/{userId}',
        method: 'post',
        internal: false,
        extensions: {},
      }),
      {
        id: expect.any(String),
        path: '/users/{userId}',
        method: 'put',
        request: {
          cookie: [],
          headers: [],
          path: [],
          query: [],
        },
        responses: [],
        security: [],
        servers: [],
        tags: [],
        extensions: {},
      },
    ]);
  });

  it('given malformed parameters should translate operation with those parameters', () => {
    const document: Partial<OpenAPIObject> = {
      swagger: '2.0',
      paths: {
        '/users/{userId}': {
          get: {
            parameters: [
              {
                in: 'header',
                name: 'name',
              },
              null,
            ],
          },
        },
      },
    };

    expect(
      transformOas2Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toStrictEqual({
      id: expect.any(String),
      method: 'get',
      path: '/users/{userId}',
      request: {
        cookie: [],
        headers: [
          {
            id: expect.any(String),
            name: 'name',
            style: 'simple',
          },
        ],
        path: [],
        query: [],
      },
      responses: [],
      security: [],
      servers: [],
      tags: [],
      extensions: {},
    });
  });
});
