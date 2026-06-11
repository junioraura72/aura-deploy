'use client';

import { useEffect } from 'react';

export default function ArchitectAutoTrigger() {
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/architect/build', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature: 'startup-trigger' })
        });
        const data = await res.json();
        console.log('Architect startup trigger:', data);
      } catch (error) {
        console.error('Architect startup trigger failed:', error);
      }
    };

    run();
  }, []);

  return null;
}
