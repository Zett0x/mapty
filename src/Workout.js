const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export class Workout {
  #id;
  #distance;
  #duration;
  #coords;
  #name;
  #type;
  #date;
  constructor(coords, distance, duration, type) {
    this.#id = Date.now();
    this.#distance = distance; //in km
    this.#duration = duration; //in min
    this.#coords = coords; // [lat,lng]
    this.#type = type;
    this.#date = new Date();
    this.#name = `${this.#type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${
      type[0].toUpperCase() + type.slice(1)
    } on ${months[this.#date.getMonth()]} ${this.#date.getDate()}`;
  }
  get distance() {
    return this.#distance;
  }

  get duration() {
    return this.#duration;
  }

  get id() {
    return this.#id;
  }

  get coords() {
    return this.#coords;
  }
  get name() {
    return this.#name;
  }

  get type() {
    return this.#type;
  }
}
