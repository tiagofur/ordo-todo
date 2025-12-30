import { Logger } from '@nestjs/common';

/**
 * State of the Circuit Breaker
 */
export enum CircuitBreakerState {
    CLOSED,
    OPEN,
    HALF_OPEN,
}

/**
 * Options for the Circuit Breaker
 */
export interface CircuitBreakerOptions {
    /** Number of failures before opening the circuit. Default: 5 */
    failureThreshold?: number;
    /** Time in ms before trying to close the circuit (transition from OPEN to HALF_OPEN). Default: 10000 (10s) */
    resetTimeout?: number;
    /** Number of successes needed in HALF_OPEN state to close the circuit. Default: 2 */
    successThreshold?: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
    failureThreshold: 5,
    resetTimeout: 10000,
    successThreshold: 2,
};

// Global map to store circuit states (sharing across instances might be needed for some services)
// For a truly distributed system, this should be in Redis.
const circuits = new Map<string, any>();

/**
 * Decorator to apply Circuit Breaker pattern to a method.
 * Protects against cascading failures when calling external services.
 * 
 * @example
 * ```typescript
 * @CircuitBreaker({ failureThreshold: 3, resetTimeout: 5000 })
 * async callExternalService() { ... }
 * ```
 */
export function CircuitBreaker(options: CircuitBreakerOptions = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const logger = new Logger('CircuitBreaker');

    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        const className = target.constructor.name === 'Function' ? target.name : target.constructor.name;
        const circuitKey = `${className}.${propertyKey}`;

        if (!circuits.has(circuitKey)) {
            circuits.set(circuitKey, {
                state: CircuitBreakerState.CLOSED,
                failures: 0,
                successes: 0,
                lastFailureTime: 0,
            });
        }

        descriptor.value = async function (...args: any[]) {
            const circuit = circuits.get(circuitKey);

            // Check if circuit is open and should be transitioned to half-open
            if (circuit.state === CircuitBreakerState.OPEN) {
                if (Date.now() - circuit.lastFailureTime > (mergedOptions.resetTimeout ?? 10000)) {
                    circuit.state = CircuitBreakerState.HALF_OPEN;
                    logger.warn(`Circuit ${circuitKey} transitioned to HALF_OPEN`);
                } else {
                    logger.error(`Circuit ${circuitKey} is OPEN. Blocking request to prevent cascading failure.`);
                    throw new Error(`Circuit ${circuitKey} is currently OPEN due to repeated failures`);
                }
            }

            try {
                const result = await originalMethod.apply(this, args);

                // On success
                if (circuit.state === CircuitBreakerState.HALF_OPEN) {
                    circuit.successes++;
                    if (circuit.successes >= (mergedOptions.successThreshold ?? 2)) {
                        circuit.state = CircuitBreakerState.CLOSED;
                        circuit.failures = 0;
                        circuit.successes = 0;
                        logger.log(`Circuit ${circuitKey} transitioned back to CLOSED after ${mergedOptions.successThreshold} successes`);
                    }
                } else if (circuit.state === CircuitBreakerState.CLOSED) {
                    circuit.failures = 0;
                }

                return result;
            } catch (error) {
                // On failure
                circuit.failures++;
                circuit.lastFailureTime = Date.now();
                circuit.successes = 0;

                if (circuit.state === CircuitBreakerState.CLOSED) {
                    if (circuit.failures >= (mergedOptions.failureThreshold ?? 5)) {
                        circuit.state = CircuitBreakerState.OPEN;
                        logger.error(`Circuit ${circuitKey} transitioned to OPEN after ${circuit.failures} failures`);
                    }
                } else if (circuit.state === CircuitBreakerState.HALF_OPEN) {
                    circuit.state = CircuitBreakerState.OPEN;
                    logger.error(`Circuit ${circuitKey} transitioned back to OPEN after failure in HALF_OPEN`);
                }

                throw error;
            }
        };

        return descriptor;
    };
}
