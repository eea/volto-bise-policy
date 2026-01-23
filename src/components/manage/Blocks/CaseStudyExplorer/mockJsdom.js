Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(),
});
Object.defineProperty(HTMLCanvasElement, 'getContext', {
  writable: true,
  value: jest.fn(),
});
