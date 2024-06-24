import StoreKit

// Only keeps latest promise, assumes older promises are not needed
// Avoids racing conditions by storing latestPromise in a thread safe var
// Cancels previous promises when new ones are added
// Should not be used when all promises are relevant (e.g. Purchases)
class LatestPromiseKeeper {
    private var latestPromise: ThreadSafe<(RCTPromiseResolveBlock, RCTPromiseRejectBlock)?> = ThreadSafe(nil)
    private var latestRequest: ThreadSafe<SKProductsRequest?> = ThreadSafe(nil)

    func setLatestPromise(request: SKProductsRequest, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // Cancel the ongoing request and reject the existing promise before setting a new one
        cancelOngoingRequest()

        latestRequest.atomically { $0 = request }
        latestPromise.atomically { $0 = (resolve, reject) }
    }

    func cancelOngoingRequest() {
        latestPromise.atomically { promiseResolvers in
            if let (_, reject) = promiseResolvers {
                // Reject the promise with an error indicating that it was cancelled due to a new request
                reject("E_CANCELED", "Previous request was cancelled due to a new request", nil)
            }
        }

        latestRequest.atomically { ongoingRequest in
            ongoingRequest?.cancel()
            ongoingRequest = nil
        }

        clearLatestPromiseAndRequest()
    }

    func resolveIfRequestMatches(matchingRequest: SKProductsRequest, items: [[String: Any?]], operation: (RCTPromiseResolveBlock, [[String: Any?]]) -> Void) {
        latestPromise.atomically { promiseResolvers in
            guard let (resolve, _) = promiseResolvers else { return }

            latestRequest.atomically { ongoingRequest in
                guard ongoingRequest === matchingRequest else { return }

                operation(resolve, items)
            }
        }
        clearLatestPromiseAndRequest()
    }

    private func clearLatestPromiseAndRequest() {
        latestPromise.atomically { $0 = nil }
        latestRequest.atomically { $0 = nil }
    }
}
