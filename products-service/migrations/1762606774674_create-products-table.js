exports.up = (pgm) => {
  pgm.createTable('products', {
    id: 'id',
    name: { type: 'text', notNull: true },
    price: { type: 'numeric(10,2)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('products');
};
