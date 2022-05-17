const { startHotContentReloadSocketServer } = require('@stackbit/nextjs-hot-content-reload');
const chokidar = require('chokidar');

const CONTENT_DIR = process.env.SB_DEMO_CONTENT || 'sb-content';

let socketServer = null;
function onContentChange(filePath) {
    socketServer.notifyPropsChanged();
}

function init() {
    if (!socketServer) {
        socketServer = startHotContentReloadSocketServer();
        const watcher = chokidar.watch(CONTENT_DIR, { ignoreInitial: true });
        watcher.on('add', onContentChange);
        watcher.on('change', onContentChange);
        watcher.on('unlink', onContentChange);
    }
}

module.exports = {
    nextWithHotContentReload: function (nextConfig) {
        return {
            ...nextConfig,
            // Next.js doesn't provide a plugin system, so (ab)using the `redirects` hook
            redirects: async () => {
                init();
                return nextConfig.redirects ? nextConfig.redirects() : [];
            },
            // Don't recompile when files in the content folder change.
            webpack: (config, context) => {
                if (context.isServer) {
                    config.watchOptions.ignored.push(`**/${CONTENT_DIR}/**`);
                }
                return nextConfig.webpack ? nextConfig.webpack(config, context) : config;
            }
        };
    }
};
