import validateEnv from './utils/validateEnv.js';
import initWebService from './utils/initWebService.js';
import { initModels } from './models/index.js';
import setGracefulShuwdown from './utils/setGracefulShuwdown.js';

const shutdown = {
    enabled: false,
    running: 0,
};

(async () => {
    process.env = validateEnv(process.env);
    setGracefulShuwdown();
    await initModels();
    await initWebService();
})();

export default shutdown;
