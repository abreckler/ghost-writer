declare module 'gpt-3-encoder' {
  function encode(text: string) : Array<any>;
  function decode(tokens: Array<any>): string;
}