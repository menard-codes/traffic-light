document.addEventListener("DOMContentLoaded", () => {
  class Timer {
    _currentCount = 0;
    _interval = null;
    _timer = document.querySelector("#timer");

    constructor() {
      this._timer.textContent = this._currentCount;
    }

    /**
     * @param {{ maxCount: number; currentColor: TrafficLightColor }}
     */
    start({ maxCount, currentColor }) {
      // Reset count and clear any existing interval before starting fresh
      this._currentCount = maxCount;
      this._setTimerDisplay({ currentColor });

      if (this._interval !== null) {
        clearInterval(this._interval);
      }

      this._interval = setInterval(() => {
        this._currentCount--;

        if (this._currentCount <= 0) {
          this.stop();
        }

        this._setTimerDisplay({ currentColor });
      }, 1000);
    }

    stop() {
      if (this._interval !== null) {
        clearInterval(this._interval);
        this._interval = null;
        this._currentCount = 0;
        this._timer.classList.remove("warn");
      }
    }

    /**
     * @param {{ currentColor: TrafficLightColor }} param0
     */
    _setTimerDisplay({ currentColor }) {
      this._timer.textContent = String(this._currentCount).padStart(2, "0");
      switch (currentColor) {
        case "green": {
          this._timer.classList.add("go");
          this._timer.classList.remove("wait");
          this._timer.classList.remove("stop");
          break;
        }
        case "red": {
          this._timer.classList.add("stop");
          this._timer.classList.remove("wait");
          this._timer.classList.remove("go");
          break;
        }
        case "yellow": {
          this._timer.classList.add("wait");
          this._timer.classList.remove("go");
          this._timer.classList.remove("stop");
          break;
        }
      }
    }
  }

  /**
   * @typedef {'red' | 'yellow' | 'green'} TrafficLightColor
   */
  class Light {
    /**
     * @param {TrafficLightColor} color
     */
    constructor(color) {
      this.color = color;
      this._dom = document.querySelector(`.${color}`);
    }

    /**
     * @param {TrafficLightColor} currentColor
     */
    notify(currentColor) {
      if (currentColor === this.color) {
        this._turnOn();
      } else {
        this._turnOff();
      }
    }

    _turnOn() {
      this._dom.classList.add("on");
    }

    _turnOff() {
      this._dom.classList.remove("on");
    }
  }

  class TrafficLight {
    _listeners = [new Light("red"), new Light("yellow"), new Light("green")];

    /**
     *
     * @param {{ timeInterval: number }} {timeInterval} - Time interval in seconds for switching the lights.
     */
    constructor({ timeInterval } = {}) {
      this._timeInterval = timeInterval ?? 60;
    }

    async run() {
      const timer = new Timer();
      const listenersLength = this._listeners.length;
      let currentPointer = listenersLength;
      while (true) {
        const nextPointer = currentPointer - 1;
        currentPointer = nextPointer < 0 ? listenersLength - 1 : nextPointer;
        const colors = this._listeners.map((listener) => listener.color);
        const currentColor = colors[currentPointer];

        this._listeners.forEach((listener) => listener.notify(currentColor));

        // Start timer AFTER switching the light, so count is in sync with current light

        const sleepInMS =
          currentColor === "yellow"
            ? Math.max(this._timeInterval - (this._timeInterval - 6), 6) * 1000
            : this._timeInterval * 1000;

        timer.start({ maxCount: sleepInMS / 1000, currentColor });

        await this._sleep(sleepInMS);

        timer.stop();
      }
    }

    async _sleep(time = 1000) {
      await new Promise((res) => setTimeout(res, time));
    }
  }

  const trafficLight = new TrafficLight({ timeInterval: 15 });
  trafficLight.run();
});
