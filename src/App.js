import { Cycling } from './Cycling.js';
import { Running } from './Running.js';
//import { Cycling } from 'Cycling';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

export class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 10;
  #enMovimiento = false;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkOut.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopUp.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(
            'We couldnt find your position, allow geolocation to this page.'
          );
        }
      );
    }
  }
  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    this.#map = L.map('map').setView([latitude, longitude], 13);
    //console.log(this.#map);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    //
    this.#mapEvent = mapE;
    if (form.classList.contains('hidden')) form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hiddeForm() {
    form.style.display = 'none';
    if (!form.classList.contains('hidden')) form.classList.add('hidden');
    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value =
      '';
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkOut(e) {
    e.preventDefault();

    //get common data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;

    const { lat, lng } = this.#mapEvent.latlng;
    console.log(this.checkWorkoutDuplicate([lat, lng]));
    if (this.checkWorkoutDuplicate([lat, lng])) {
      console.log('haciendo comprobacion');
      return alert('Ya existe un workout en esa posición');
    }

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositiveInputs = (...inputs) => inputs.every(inp => inp > 0);

    //if workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositiveInputs(distance, duration, cadence)
      ) {
        return alert('You must use positive values in the form!');
      }
      // add new object to workout array

      workout = new Running([lat, lng], distance, duration, type, cadence);

      this.#workouts.push(workout);
      console.log(this.#workouts);
    }

    // if workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositiveInputs(distance, duration)
      ) {
        return alert('You must use positive values in the form!');
      }
      // add new object to workout array
      workout = new Cycling([lat, lng], distance, duration, type, elevation);

      this.#workouts.push(workout);
      console.log(this.#workouts);
    }
    //SAVE IN LOCAL STORAGE, not implemented yet
    this._saveLocalStorage();

    //render workout on map as market
    this.renderMarker(workout);

    //clear inputs and add in the list

    this.renderWorkoutList(workout);
    this._hiddeForm();
  }
  renderMarker(workout) {
    console.log(workout.type);
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.name)
      .openPopup();
  }

  checkWorkoutDuplicate(coords) {
    console.log(this.#workouts);
    if (this.#workouts.length > 0) {
      for (let i = 0; i < this.#workouts.length; i++) {
        if (
          this.#workouts[i].coords[0] === coords[0] &&
          this.#workouts[i].coords[1] === coords[1]
        ) {
          return true;
        }
      }
      return false;
    }
  }
  renderWorkoutList(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
          <h2 class="workout__title">${workout.name}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
         </div>`;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(2)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    } else {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(2)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopUp(e) {
    //console.log(e.target);

    if (this.#enMovimiento === false) {
      if (this.#workouts.length > 0) {
        const liElement = e.target.closest('.workout');
        if (!liElement) return;
        const dataID = +liElement.getAttribute('data-id');
        let coords;
        console.log(this.#enMovimiento);

        for (let i = 0; i < this.#workouts.length; i++) {
          if (dataID === this.#workouts[i].id) {
            console.log('ejecutando bucle');
            coords = this.#workouts[i].coords;
            break;
          }
        }
        const centerOfView = this.#map.getCenter();
        const coordsView = [centerOfView.lat, centerOfView.lng];
        const dist = this._calculateDistanceBetTwoPoints(coordsView, coords);
        console.log('distancia;', dist);
        if (
          coordsView[0].toFixed(1) === coords[0].toFixed(1) &&
          coordsView[1].toFixed(1) === coords[1].toFixed(1)
        ) {
          this.#enMovimiento = false;
          return;
        }

        this.#enMovimiento = true;
        if (dist > 0.8 && dist <= 11) {
          //if (this.#map.getZoom() > 9) {
          this.#map.setZoom(9, {
            animate: true,
            pan: {
              duration: 1,
            },
          });
          // }

          setTimeout(() => {
            this.#map.setView(coords, 9, {
              animate: true,
              pan: {
                duration: 1.5,
              },
            });
          }, 600);

          setTimeout(() => {
            const c = this.#map.getCenter();
            const coView = [c.lat, c.lng];
            console.log(coView[0].toFixed(2), coords[0].toFixed(2));
            if (
              coView[0].toFixed(1) === coords[0].toFixed(1) &&
              coView[1].toFixed(1) === coords[1].toFixed(1)
            ) {
              this.#map.setZoom(13, {
                animate: true,
                pan: {
                  duration: 1,
                },
              });
            }
            this.#enMovimiento = false;
          }, 2200);
        } else if (dist > 11) {
          console.log('entramos bucle lejano');
          //if (this.#map.getZoom() > 10) {
          this.#map.setZoom(5, {
            animate: true,
            pan: {
              duration: 2.5,
            },
          });
          //}
          setTimeout(() => {
            this.#map.setView(
              coords,
              5,
              {
                animate: true,
                pan: {
                  duration: 1,
                },
              },
              2500
            );
          });
          setTimeout(() => {
            const c = this.#map.getCenter();
            const coView = [c.lat, c.lng];
            if (
              coView[0].toFixed(1) === coords[0].toFixed(1) &&
              coView[1].toFixed(1) === coords[1].toFixed(1)
            ) {
              this.#map.setZoom(13, {
                animate: true,
                pan: {
                  duration: 2.5,
                },
              });
            }

            this.#enMovimiento = false;
          }, 2000);
        } else if (dist > 0 && dist <= 0.8) {
          //if (this.#map.getZoom() > 13) {
          this.#map.setZoom(11, {
            animate: true,
            pan: {
              duration: 1.5,
            },
          });
          // }
          setTimeout(() => {
            this.#map.setView(coords, 11, {
              animate: true,
              pan: {
                duration: 0.5,
              },
            });
          }, 400);
          setTimeout(() => {
            const c = this.#map.getCenter();
            const coView = [c.lat, c.lng];
            if (
              coView[0].toFixed(1) === coords[0].toFixed(1) &&
              coView[1].toFixed(1) === coords[1].toFixed(1)
            ) {
              this.#map.setZoom(13, {
                animate: true,
                pan: {
                  duration: 2,
                },
              });
            }

            this.#enMovimiento = false;
          }, 1000);
        }
      }
    }
  }
  _calculateDistanceBetTwoPoints(coord1, coord2) {
    const dist = Math.sqrt(
      (coord1[0] - coord2[0]) ** 2 + (coord1[1] - coord2[1]) ** 2
    );
    console.log(dist);
    return dist;
  }
  // FALTA TERMINAR, NO FUNCIONA BIEN EL LOCAL STORAGE, PUEDE QUE SEA PORQUE SE CARGA LA HERENCIA.
  _saveLocalStorage() {
    localStorage.setItem('test', JSON.stringify(this.#workouts));

    console.log(JSON.stringify(this.#workouts));
  }
}
