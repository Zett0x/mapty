import { Workout } from './Workout.js';

export class Cycling extends Workout {
  #elevationGain;
  #speed;

  constructor(coords, distance, duration, type, elevationGain) {
    super(coords, distance, duration, type);
    this.#elevationGain = elevationGain;
    this.#speed = this.calcSpeed();
  }
  calcSpeed() {
    return this.distance / (this.duration / 60);
  }
  get speed() {
    return this.#speed;
  }
  get elevationGain() {
    return this.#elevationGain;
  }
}
