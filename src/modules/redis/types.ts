export type Payload = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key: string]: unknown;
};

export type PubSubMessage<T> = Payload & T;
