import { pingz } from '../../pingz/pingz.swagger';
import { notes } from '../../notes/notes.swagger';
import { openai } from '../../openai/openai.swagger';
import { rapidapi } from '../../rapidapi/rapidapi.swagger';
import { starship } from '../../article-generator/article-generator.swagger';
import { info, servers, securitySchemes } from './common';
import { Pingz, User, Note, Deleted, StarShip } from './common/schemas';

export const swaggerDocument = {
  openapi: '3.0.1',
  info: { ...info, version: 'Orange' },
  servers,
  components: {
    schemas: {
      Pingz,
      User,
      Note,
      Deleted,
      StarShip,
    },
  },
  securitySchemes,
  tags: [],
  paths: {
    ...pingz,
    ...notes,
    ...openai,
    ...rapidapi,
    ...starship,
  },
};
