// Importing packages
import { v4 as uuid } from 'uuid';

export const generateUUID = () => {
  const generatedUUID = uuid();
  return generatedUUID.replace(/-/g, '');
};

export default {
  generateUUID
};
