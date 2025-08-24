import {License} from './License';
import {Meaning} from './Meaning';
import {Phonetic} from './Phonetic';

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license: License;
  sourceUrls: string[];
}
