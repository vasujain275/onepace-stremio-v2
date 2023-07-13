#!/usr/bin/env node
require('dotenv').config()

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk");

const addon = require("./addon");

addon.addonBuilder().then((result)=>{
    serveHTTP(result, { port:  process.env.PORT || 3000 });
})

// publishToCentral("https://my-addon.awesome/manifest.json")
