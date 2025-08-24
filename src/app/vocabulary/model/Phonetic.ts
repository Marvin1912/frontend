import {License} from './License';

export interface Phonetic {
  text: string;
  audio: string;
  sourceUrl?: string;
  license?: License;
}
