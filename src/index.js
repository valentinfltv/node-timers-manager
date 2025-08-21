const TimersManager = require('./timersManager.js');

const manager = new TimersManager();

const t1 = {
  name: 't1',
  delay: 1000,
  interval: false,
  job: () => { console.log('t1 fired'); }
};

const t2 = {
  name: 't2',
  delay: 2000,
  interval: false,
  job: (a, b) => console.log(`t2 result: ${a + b}`)
};



manager.add(t1).add(t2, 1, 2);
manager.start();
console.log("Started");

setTimeout(() => manager.pause('t1'), 500);
setTimeout(() => manager.resume('t1'), 1500);