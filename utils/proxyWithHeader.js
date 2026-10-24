import proxy from 'express-http-proxy'

export const proxyWithHeader = (serviceUrl) => {
    return proxy(serviceUrl, {
        timeout: 60000,
        proxyErrorHandler: (err, res, next) => {
            console.error("Proxy error:", err.code, err.message)
            res.status(503).json({ message: "Upstream service unavailable" })
        },
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            if (srcReq.user) {
                proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
            }
            return proxyReqOpts
        }
    })
}