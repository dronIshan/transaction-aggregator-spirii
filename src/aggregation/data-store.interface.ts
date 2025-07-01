export interface AggregationStore {
  increment(key: string, field: string, amount: number): Promise<number>;

  getAll(key: string): Promise<Record<string, string>>;

  keys(pattern: string): AsyncIterable<string>;
}
