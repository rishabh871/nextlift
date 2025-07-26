const path = require("path");
module.exports = {
    output: "standalone",
    images: {
        domains: ["localhost","nextlift.s3.amazonaws.com","nextlift.regiustechnologies.com","nextlift.com.au"],
    },
    webpack: config => {
        return config
    }
}
