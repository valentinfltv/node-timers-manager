class TimersManager {
 constructor() {
   this.timers = [];
   this.started = false;
 }

 _validateTimer(timer) {
    if (!timer || typeof timer !== 'object') throw new Error("Timer must be an object");
    const { name, delay, interval, job } = timer; //get object fields from timer obj in one line 

    if (typeof name !== 'string' || name.trim() === '') throw new Error("Invalid timer name");
    if (typeof delay !== 'number' || delay < 0 || delay > 5000) throw new Error("Invalid delay");
    if (typeof interval !== 'boolean') throw new Error("Invalid interval flag");
    if (typeof job !== 'function') throw new Error("Invalid job function");
  }

 add(timer, ...args) {
    if (this.started) throw new Error("Cannot add timer after start");
    this._validateTimer(timer);

    // Check for duplicate name
    if (this.timers.find(t => t.name === timer.name)) {
      throw new Error(`Timer with name "${timer.name}" already exists`);
    }

    this.timers.push({
      ...timer,
      args,
      id: null,
      paused: false,
      remaining: timer.delay,
      startTime: null,
    });

    return this; // allow chaining
  }

 remove(name) {
    const index = this.timers.findIndex(t => t.name === name);
    if (index === -1) return;

    const timer = this.timers[index];

    if (timer.interval) {
      clearInterval(timer.id);
    } else {
      clearTimeout(timer.id);
    }

    this.timers.splice(index, 1); // remove from array
  }

 start() {
    if (this.started) return;
    this.started = true;

    for (const timer of this.timers) {
      this._runTimer(timer);
    }
  }

 _runTimer(timer) {
    timer.startTime = Date.now();

    const execute = () => {
      try {
        timer.job(...timer.args);
      } catch (err) {
        console.error(`Timer ${timer.name} job error:`, err);
      }
    };

    if (timer.interval) {
      timer.id = setInterval(execute, timer.delay);
    } else {
      timer.id = setTimeout(() => {
        execute();
        this.remove(timer.name); // cleanup after one-time run
      }, timer.delay);
    }
  }

 stop() {
    for (const timer of this.timers) {
      if (timer.interval) {
        clearInterval(timer.id);
      } else {
        clearTimeout(timer.id);
      }

      timer.id = null;
      timer.paused = false;
      timer.remaining = timer.delay;
    }

    this.started = false;
  }

  pause(name) {
    const timer = this.timers.find(t => t.name === name);
    if (!timer || timer.interval || timer.paused) return;

    const elapsed = Date.now() - timer.startTime;
    timer.remaining -= elapsed;
    clearTimeout(timer.id);
    timer.paused = true;
  }

 resume(name) {
    const timer = this.timers.find(t => t.name === name);
    if (!timer || timer.interval || !timer.paused) return;

    timer.startTime = Date.now();
    timer.id = setTimeout(() => {
      try {
        timer.job(...timer.args);
      } catch (err) {
        console.error(`Timer ${name} job error:`, err);
      }

      this.remove(name); // cleanup
    }, timer.remaining);

    timer.paused = false;
  }

}
module.exports = TimersManager; 