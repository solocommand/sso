import inquirer from 'inquirer';
import { organizationAttributes as orgAttrs } from '@parameter1/sso-db/schema';
import { getOrgList } from '../utils/index.js';
import repos from '../../repos.js';

const { log } = console;

export default async () => {
  const questions = [
    {
      type: 'list',
      name: 'org',
      message: 'Select the organization',
      choices: getOrgList,
    },
    {
      type: 'input',
      name: 'slug',
      default: ({ org }) => org.slug,
      message: 'Enter the new organization slug',
      validate: async (input, { org }) => {
        const { error } = orgAttrs.slug.required().validate(input);
        if (error) return error;

        if (input === org.slug) return true;

        const doc = await repos.$('organization').findBySlug({ slug: input, options: { projection: { _id: 1 } } });
        if (doc) return new Error('An existing record is already using this slug.');
        try {
          await repos.$('organization').throwIfSlugHasRedirect({ id: org._id, slug: input });
          return true;
        } catch (e) {
          return e;
        }
      },
      filter: (input) => {
        const { value } = orgAttrs.slug.validate(input);
        return value;
      },
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to complete this action?',
      default: false,
    },
  ];

  const {
    confirm,
    org,
    slug,
  } = await inquirer.prompt(questions);

  if (!confirm) return;

  const result = await repos.$('organization').updateSlug({
    id: org._id,
    slug,
  });
  log(result);
};
