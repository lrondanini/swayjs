export declare class Observer<T extends Record<string, (...args: any[]) => void>> {
    private eventMap;
    constructor();
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void;
    on<K extends keyof T>(event: K, callback: T[K]): void;
    off<K extends keyof T>(event: K, callback: T[K]): void;
}
