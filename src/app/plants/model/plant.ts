import {PlantLocation} from './plantLocation';

export interface Plant {
  id: number,
  name: string,
  species: string,
  description: string,
  careInstructions: string,
  location: PlantLocation,
  wateringFrequency: number,
  lastWateredDate: Date | null,
  nextWateredDate: Date | null,
  image: string | null
}
