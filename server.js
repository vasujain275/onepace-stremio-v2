#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk");

const addon = require("./addon");

addon.addonBuilder().then((result)=>{
    serveHTTP(result, { port: 7000 || process.env.PORT });
})

// publishToCentral("https://my-addon.awesome/manifest.json")
