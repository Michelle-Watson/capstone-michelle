const formatPriceFields = (price) => ({
  ...price,
  original_price: parseFloat(price.original_price),
  discount: parseFloat(price.discount),
  discounted_price: parseFloat(price.discounted_price),
});

export { formatPriceFields };
