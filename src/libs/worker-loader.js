export default class WorkerLoader extends Worker {
  constructor(worker, onMessage) {
      const code = worker.toString();
      const blob = new Blob([`(${code})()`]);
      const workerUrl = URL.createObjectURL(blob);

      const instance = new Worker(workerUrl);
      
      if (instance) {
          URL.revokeObjectURL(workerUrl);
      }

      if (onMessage) {
          instance.onmessage = onMessage;
      }

      return instance;
  }
}