export class FunctionQueue {
  private queue: any[];
  private isRunning: boolean;

  constructor() {
    this.queue = [];
    this.isRunning = false;
  }

  async enqueue(fn) {
    this.queue.push(fn);
    await this.run();
    return fn;
  }

  async run() {
    if (this.isRunning || this.queue.length === 0) return;
    this.isRunning = true;
    const fn = this.queue.shift();
    await fn();
    this.isRunning = false;
    await this.run();
  }
}
