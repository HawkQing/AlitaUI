import { useState, useEffect } from 'react';

export default function useThrottle(callback, delay) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (pending) {
      setTimeout(() => {
        callback();
        setPending(false);
      }, delay);
    }
  }, [callback, delay, pending]);

  const throttled = (...args) => {
    if (!pending) {
      setPending(true);
      callback(...args);
    }
  };

  return throttled;
}

export function useThrottleValue(value, delay) {
  const [throttled, setThrottled] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottled(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return throttled;
}