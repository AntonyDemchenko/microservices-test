import { Counter, Registry } from 'prom-client';

export const register = new Registry();
export const createdCounter = new Counter({
  name: 'products_created_total',
  help: 'Created products',
});
export const deletedCounter = new Counter({
  name: 'products_deleted_total',
  help: 'Deleted products',
});

register.registerMetric(createdCounter);
register.registerMetric(deletedCounter);
