const path = require("path");

module.exports = {
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "path": require.resolve("path-browserify"),
            "fs": false // 必要なければ無効化
        }
    }
};
