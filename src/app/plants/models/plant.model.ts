import {PlantLocation} from './plant-location.enum';

export interface Plant {
  id: number,
  name: string,
  species: string,
  description: string,
  careInstructions: string,
  location: PlantLocation,
  wateringFrequency: number,
  lastWateredDate: string | null,
  nextWateredDate: string | null,
  image: string | null
}
