export class FunctionQueue {
  private queue: any[];
  private isRunning: boolean;

  constructor() {
    this.queue = [];
    this.isRunning = false;
  }

  async enqueue(fn: () => Promise<void>): Promise<boolean> {
    this.queue.push(fn);
    await this.run();
    return true;
  }

  async run(): Promise<void> {
    if (this.isRunning || this.queue.length === 0) return;
    this.isRunning = true;
    const fn = this.queue.shift();
    await fn();
    this.isRunning = false;
    await this.run();
  }
}
