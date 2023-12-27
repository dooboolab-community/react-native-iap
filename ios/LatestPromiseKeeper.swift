import StoreKit

// Only keeps latest promise, assumes older promises are not needed
// Avoids racing conditions by storing latestPromise in a thread safe var
// Cancels previous promises when new ones are added
// Should not be used when all promises are relevant (e.g. Purchases)
class LatestPromiseKeeper {
    private var latestPromise: ThreadSafe<(RCTPromiseResolveBlock, RCTPromiseRejectBlock)?> = ThreadSafe(nil)
    private var latestRequest: ThreadSafe<SKProductsRequest?> = ThreadSafe(nil)

    func setLatestPromise(request: SKProductsRequest, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        cancelOngoingRequest()

        latestRequest.atomically { $0 = request }
        latestPromise.atomically { $0 = (resolve, reject) }
    }

    func cancelOngoingRequest() {
        latestRequest.atomically { ongoingRequest in
            ongoingRequest?.cancel()
            ongoingRequest = nil
        }

        latestPromise.atomically { $0 = nil }
    }

    func resolveIfRequestMatches(matchingRequest: SKProductsRequest, items: [[String: Any?]], operation: (RCTPromiseResolveBlock, [[String: Any?]]) -> Void) {
        latestPromise.atomically { promiseResolvers in
            guard let (resolve, _) = promiseResolvers else { return }

            latestRequest.atomically { ongoingRequest in
                guard ongoingRequest === matchingRequest else { return }

                operation(resolve, items)
            }
        }
    }
}
