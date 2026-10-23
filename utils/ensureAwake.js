const lastOk = new Map()
const inFlight = new Map()

const wake = async (serviceUrl, maxWaitMs) => {
    const deadline = Date.now() + maxWaitMs
    while (Date.now() < deadline) {
        try {
            const r = await fetch(serviceUrl, { signal: AbortSignal.timeout(10000) })
            console.log("ping", serviceUrl, r.status)   // remove later
            if (r.status < 500 && r.status !== 429) {
                lastOk.set(serviceUrl, Date.now())
                return true
            }
        } catch (err) {
            console.log("ping failed", serviceUrl, err.message)   // remove later
        }
        await new Promise(r => setTimeout(r, 5000))
    }
    return false
}

export const ensureAwake = (serviceUrl, { maxWaitMs = 60000, freshMs = 5 * 60 * 1000 } = {}) => {
    return async (req, res, next) => {
        if (Date.now() - (lastOk.get(serviceUrl) || 0) < freshMs) return next()

        if (!inFlight.has(serviceUrl)) {
            inFlight.set(serviceUrl, wake(serviceUrl, maxWaitMs).finally(() => inFlight.delete(serviceUrl)))
        }
        const ok = await inFlight.get(serviceUrl)
        if (ok) return next()
        res.status(503).json({ message: "Service is waking up, please retry shortly" })
    }
}