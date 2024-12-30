


  /******
  * 
  * INITIALIZING A PUBSUB:
  *  
  * const pubSub = initPubSub<{
  *     USER_SIGNED_IN: (email: string) => void;
  *      USER_LOGGED_OUT: () => void;
  * }>();
  * 
  * 
  * ADDING HANDLERS:
  * pubSub.on("USER_SIGNED_IN", (id: number) => { });
  * 
  * FIRING EVENTS:
  * pubSub.emit("USER_SIGNED_IN", 123);
  * 
  */
 
export class Observer<T extends Record<string, (...args: any[]) => void>> {
  private eventMap = {} as Record<keyof T, Set<(...args: any[]) => void>>;
  
  constructor() {
  }

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>) {
    (this.eventMap[event] ?? []).forEach((cb) => cb(...args));
  }

  on<K extends keyof T>(event: K, callback: T[K]) {
    if (!this.eventMap[event]) {
      this.eventMap[event] = new Set();
    }
      
    this.eventMap[event].add(callback);
  }

  off<K extends keyof T>(event: K, callback: T[K]) {
    if (!this.eventMap[event]) {
      return;
    }
    this.eventMap[event].delete(callback);
  }

}



  // initPubSub<T extends Record<string, (...args: any[]) => void>>() {
  //   const eventMap = {} as Record<keyof T, Set<(...args: any[]) => void>>;
  
  //   return {
  //     emit: <K extends keyof T>(event: K, ...args: Parameters<T[K]>) => {
  //       (eventMap[event] ?? []).forEach((cb) => cb(...args));
  //     },
  
  //     on: <K extends keyof T>(event: K, callback: T[K]) => {
  //       if (!eventMap[event]) {
  //         eventMap[event] = new Set();
  //       }
  
  //       eventMap[event].add(callback);
  //     },
  
  //     off: <K extends keyof T>(event: K, callback: T[K]) => {
  //       if (!eventMap[event]) {
  //         return;
  //       }
  
  //       eventMap[event].delete(callback);
  //     },
  //   };
  // }