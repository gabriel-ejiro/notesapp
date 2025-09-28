import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
We’re defining two models here:
- Todo: A simple task with "content" and "isDone".
- Note: A note with "name", "description", and "image".
=========================================================================*/

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      isDone: a.boolean(),
    })
    .authorization((allow) => [allow.guest()]),

  Note: a
    .model({
      name: a.string(),
      description: a.string(),
      image: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
});

// Export schema type for TypeScript
export type Schema = ClientSchema<typeof schema>;

// Define data and authorization modes
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});

