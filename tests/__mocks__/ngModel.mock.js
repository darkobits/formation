export default function createNgModel ({name, properties} = {}) {
  return Object.assign({
    $name: name,
    $touched: false,
    $dirty: false
  }, properties);
}
