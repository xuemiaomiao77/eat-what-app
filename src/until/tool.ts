export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
};

export const throttle = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
        if (timer) return;
        timer = setTimeout(() => {
            fn.apply(this, args);
            timer = null
        }, delay);
    };
};

let timer: ReturnType<typeof setTimeout> | null = null
export const delay = (timeout: number): Promise<void> => {
    return new Promise(resolve => {
        timer = setTimeout(() => {
            if(timer)clearTimeout(timer)
            resolve()
        }, timeout)
    })
}


