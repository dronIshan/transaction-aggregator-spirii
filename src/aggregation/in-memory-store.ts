import { AggregationStore } from './data-store.interface';

export class InMemoryStore implements AggregationStore {
  private data: Record<string, Record<string, string>> = {};

  async increment(key: string, field: string, amount: number): Promise<number> {
    const record = this.data[key] ?? (this.data[key] = {});
    const current = parseFloat(record[field] || '0');
    const updated = current + amount;
    record[field] = String(updated);
    return updated;
  }

  async getAll(key: string): Promise<Record<string, string>> {
    return this.data[key] ?? {};
  }

  async *keys(pattern: string): AsyncIterable<string> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const k of Object.keys(this.data)) {
      if (regex.test(k)) {
        yield k;
      }
    }
  }
}
