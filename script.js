document.addEventListener("DOMContentLoaded", () => {
  class Timer {
    _currentCount = 0;
    _interval = null;
    _timer = document.querySelector("#timer");

    constructor() {
      this._timer.textContent = this._currentCount;
    }

    /**
     * @param {{ maxCount: number }}
     */
    start({ maxCount }) {
      // Reset count and clear any existing interval before starting fresh
      this._currentCount = 1;
      this._setTimerDisplay();

      if (this._interval !== null) {
        clearInterval(this._interval);
      }

      this._interval = setInterval(() => {
        this._currentCount++;

        if (this._currentCount > maxCount) {
          this.stop();
        }

        const warning = maxCount - maxCount * 0.16;
        const isWarning = this._currentCount >= warning;

        if (isWarning && !this._timer.classList.contains("warn")) {
          this._timer.classList.add("warn");
        }

        this._setTimerDisplay();
      }, 1000);
    }

    stop() {
      if (this._interval !== null) {
        clearInterval(this._interval);
        this._interval = null;
        this._currentCount = 1;
        this._timer.classList.remove("warn");
      }
    }

    _setTimerDisplay() {
      this._timer.textContent = String(this._currentCount).padStart(2, "0");
    }
  }

  class Light {
    /**
     * @param {string} color
     */
    constructor(color) {
      this.color = color;
      this._dom = document.querySelector(`.${color}`);
    }

    /**
     * @param {string} currentColor
     */
    notify(currenColor) {
      if (currenColor === this.color) {
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
    _currentOnIndex = -1;
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
      while (true) {
        const listenersLength = this._listeners.length;
        const nextIndex = this._currentOnIndex + 1;
        this._currentOnIndex = nextIndex > listenersLength - 1 ? 0 : nextIndex;
        const colors = this._listeners.map((listener) => listener.color);

        const currentColor = colors[this._currentOnIndex];
        this._listeners.forEach((listener) => listener.notify(currentColor));

        // Start timer AFTER switching the light, so count is in sync with current light

        const sleepInMS =
          currentColor === "yellow"
            ? Math.round(this._timeInterval * 0.1) * 1000
            : this._timeInterval * 1000;

        timer.start({ maxCount: sleepInMS / 1000 });

        await this._sleep(sleepInMS);

        timer.stop();
      }
    }

    async _sleep(time = 1000) {
      await new Promise((res) => setTimeout(res, time));
    }
  }

  const trafficLight = new TrafficLight();
  trafficLight.run();
});
