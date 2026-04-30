export function toKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function toCamelCase(str: string) {
  return str
    .toLowerCase()
    .replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase());
}

export function toPascalCase(str: string) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function resolveNames(name: string, prefix: string) {
  const kebab = toKebabCase(name);
  const camel = toCamelCase(name);
  const pascal = toPascalCase(name);

  return {
    fileName: kebab,
    className: pascal,
    variableName: camel,
    selector: `${prefix}-${kebab}`,
  };
}
