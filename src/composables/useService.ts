import { inject, provide } from "vue";


type ServiceClass<S> = { new (...args: any[]) : S };

export function provideService<S>(serviceClass: ServiceClass<S>, serviceInstance?: S) {
    const serviceName = serviceClass.name;
    console.log("Registered " + serviceClass.name + " service!");
    provide(serviceName, serviceInstance ?? new serviceClass())
}

export function useService<S extends Object>(serviceClass: ServiceClass<S>) : S {
    const serviceName = serviceClass.name;
    const injected = inject<S>(serviceName);
    if (!injected) {
        throw new Error(serviceClass.name + ' service was not provided!');
    }
    return injected;
}