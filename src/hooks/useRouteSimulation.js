import { useEffect, useState } from 'react';
 
const STEP_MS = 1000;
const TOTAL_STEPS = 60;
 
export default function useRouteSimulation(coordinates, enabled) {
  const [index, setIndex] = useState(0);
  const total = coordinates?.length ?? 0;
  const stepSize = Math.max(1, Math.ceil(total / TOTAL_STEPS));
 
  useEffect(() => {
    setIndex(0);
  }, [coordinates]);
 
  useEffect(() => {
    if (!enabled || total === 0 || index >= total - 1) return;
 
    const timer = setTimeout(() => {
      setIndex((value) => Math.min(value + stepSize, total - 1));
    }, STEP_MS);
 
    return () => clearTimeout(timer);
  }, [enabled, total, index, stepSize]);
 
  if (!enabled || total === 0) return { position: null, arrived: false };
 
  return { position: coordinates[index], arrived: index >= total - 1 };
}