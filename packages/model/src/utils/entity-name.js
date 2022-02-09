import { pascal, singular } from './inflector.js';
import { attempt, string } from '../schema.js';

export default (value) => {
  const v = attempt(value, string().required());
  return singular(pascal(v));
};
