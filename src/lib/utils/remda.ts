import { toPairs, fromPairs, isNil } from 'ramda';

const notNil = (subject: any) => !isNil(subject);
const clearObject = <T = any>(subject: Record<string | number, T>) => {
  const filteredArray = toPairs<any>(subject).filter(
    ([, value]) => notNil(value) && value !== '',
  );

  return fromPairs(filteredArray) as Record<string, T>;
};
const hasElements = (subject: any) =>
  Array.isArray(subject) ? subject.length > 0 : false;

export { clearObject, hasElements };
