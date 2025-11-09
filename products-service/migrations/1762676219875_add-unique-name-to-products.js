exports.up = (pgm) => {
  pgm.addConstraint('products', 'unique_product_name', { unique: ['name'] });
};

exports.down = (pgm) => {
  pgm.dropConstraint('products', 'unique_product_name');
};
