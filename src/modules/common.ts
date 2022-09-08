/**
 * Common interface for all native modules (iOS — AppStore, Android — PlayStore and Amazon).
 */
export interface NativeModuleProps {
  /** Required method to start a payment provider connection */
  initConnection(): Promise<boolean>;

  /** Required method to end the payment provider connection */
  endConnection(): Promise<boolean>;

  /** addListener for NativeEventEmitter */
  addListener(eventType: string): void;

  /** removeListeners for NativeEventEmitter */
  removeListeners(count: number): void;
}
