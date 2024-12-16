export class FunctionQueue {
  private readonly queue: ((...args: unknown[]) => Promise<unknown>)[];
  private isRunning: boolean;

  public constructor() {
    this.queue = [];
    this.isRunning = false;
  }

  public async enqueue(fn: () => Promise<boolean>): Promise<boolean> {
    this.queue.push(fn);
    await this.run();
    return true;
  }

  public async run(): Promise<void> {
    if (this.isRunning || this.queue.length === 0) return;
    this.isRunning = true;
    const fn = this.queue.shift();
    await fn();
    this.isRunning = false;
    await this.run();
  }
}
