export function orderObjectKeys(obj: any): any {
  return Object.entries(obj)
    .sort()
    .reduce((o: any, [k, v]) => ((o[k] = v), o), {});
}
