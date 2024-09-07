export const useConnectionMessage = <T>(name: string, data: T) => {
    // @ts-ignore
    if (typeof flutterObject !== 'undefined' && flutterObject) {
      const postInfo = JSON.stringify({ name, data });
  
      // @ts-ignore
      flutterObject.postMessage(postInfo);
    }
  };