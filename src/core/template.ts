export function compileTemplate(template: string, vars: Record<string, any>) {
  return template.replace(/<%=\s*(\w+)\s*%>/g, (_, key) => {
    return vars[key] !== undefined ? vars[key] : "";
  });
}
