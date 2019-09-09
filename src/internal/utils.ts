export async function promisifyEvent(func: (..._: any) => any, event: string | symbol) {
  return new Promise((res) => {
    func(event, () => {
      res();
    });
  });
}
