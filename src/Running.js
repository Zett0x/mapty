import { Workout } from './Workout.js';

export class Running extends Workout {
  #cadence;
  #pace;
  constructor(coords, distance, duration, type, cadence) {
    super(coords, distance, duration, type);
    this.#cadence = cadence;
    this.#pace = this.calcPace();
  }

  calcPace() {
    return this.duration / this.distance;
  }
  get pace() {
    return this.#pace;
  }
  get cadence() {
    return this.#cadence;
  }
}
