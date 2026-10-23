
const lastOk = new Map()

export const ensureAwake = (serviceUrl, { maxWaitMs = 60000, freshMs = 5 * 60 * 1000 } = {}) => {
    return async (req, res, next) => {
        if (Date.now() - (lastOk.get(serviceUrl) || 0) < freshMs) return next()

        const deadline = Date.now() + maxWaitMs
        while (Date.now() < deadline) {
            try {
                const r = await fetch(serviceUrl, { signal: AbortSignal.timeout(10000) })
                if (r.status < 500) {
                    lastOk.set(serviceUrl, Date.now())
                    return next()
                }
            } catch (_) {}
            await new Promise(r => setTimeout(r, 3000))
        }
        res.status(503).json({ message: "Service is waking up, please retry shortly" })
    }
}