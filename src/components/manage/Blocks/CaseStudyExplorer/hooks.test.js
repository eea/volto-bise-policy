import './mockJsdom';
import { renderHook, waitFor, act } from '@testing-library/react';
import superagent from 'superagent';

import { useCases } from './hooks';

jest.mock('superagent', () => ({ get: jest.fn() }));

const mockFetch = ({ text, error } = {}) => {
  const promise = error ? Promise.reject(error) : Promise.resolve({ text });
  const request = {
    set: jest.fn(() => request),
    then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
    catch: (onRejected) => promise.catch(onRejected),
  };

  superagent.get.mockReturnValue(request);
};

describe('useCases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('starts out loading', async () => {
    mockFetch({ text: '{"features": []}' });

    const { result } = renderHook(() => useCases('/cases.json'));

    expect(result.current.loading).toBe(true);
    expect(result.current.cases).toEqual([]);

    await act(async () => {});
  });

  test('exposes the fetched features and stops loading', async () => {
    mockFetch({
      text: JSON.stringify({ features: [{ properties: { path: '/a' } }] }),
    });

    const { result } = renderHook(() => useCases('/cases.json'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cases).toHaveLength(1);
    expect(result.current.error).toBe(false);
  });

  test('reports an error instead of staying in the loading state', async () => {
    mockFetch({ error: new Error('boom') });

    const { result } = renderHook(() => useCases('/cases.json'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(true);
    expect(result.current.cases).toEqual([]);
  });

  test('refetches when reload is called', async () => {
    mockFetch({ text: '{"features": []}' });

    const { result } = renderHook(() => useCases('/cases.json'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.reload());

    await waitFor(() => expect(superagent.get).toHaveBeenCalledTimes(2));
  });
});
