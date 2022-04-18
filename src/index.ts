import { OpenApi, textPlain, Types } from 'ts-openapi';

type A = {
  foo: string;
  bar: number;
};

// define the schema according to type A
const objectSchema = Types.Object({
  description: 'an object',
  required: true,
  properties: {
    foo: Types.String({
      description: 'foo',
      required: true,
    }),
    bar: Types.Number({
      description: 'bar',
      required: true,
    }),
  },
});

type B = A[];

// define the schema like type B
const arraySchema = Types.Array({
  description: 'an array',
  required: true,
  arrayType: objectSchema,
});

const openApi = new OpenApi('1.0.0', 'foo', 'bar', '');
openApi.setServers([{ url: '' }]);
openApi.addPath(
  '/test',
  {
    post: {
      tags: ['tag'],
      summary: 'to replicate issue',
      description: '',
      operationId: '/test',
      requestSchema: {
        body: objectSchema, // I cannot use arraySchema here, go to the end.
      },
      responses: {
        [200]: textPlain('success'),
      },
    },
  },
  true,
);

/**
 * if the web api needs client to send an array like below
 */

const requestBody: B = [{ foo: '123', bar: 123 }];
fetch('/test', { method: 'post', body: JSON.stringify(requestBody) }).then(
  (res) => {
    // whatever the logic is
  },
);

/**
 * which means request body should be an array,
 * now if I want to describe what the api [/test] is like,
 * I need to set requestSchema.body a instance of Joi.ArraySchema. right?
 * but requestSchema.body is of type Joi.ObjectSchema, Joi.ArraySchema instance is not allowed,
 * so it's not possible to define request body schema an Array.
 * so the solution will be:
 *   1. I change api [/test] to accept an object from request body,
 *      which is OK, but it's not so convincing.
 *   2. ts-openapi supports Joi.ArraySchema for requestSchema.body
 *      I myself think that is the perfect solution.
 */
