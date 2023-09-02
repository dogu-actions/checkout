"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const action_kit_1 = require("@dogu-tech/action-kit");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
action_kit_1.ActionKit.run(async ({ options, logger, input, deviceHostClient, consoleActionClient }) => {
    const { DOGU_ROUTINE_WORKSPACE_PATH } = options;
    const clean = input.get('clean');
    const branchOrTag = input.get('branchOrTag');
    const postCommand = input.get('postCommand');
    const checkoutPath = input.get('checkoutPath');
    const checkoutUrl = input.get('checkoutUrl');
    logger.info('resolve checkout path... from', { DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath });
    const resolvedCheckoutPath = path_1.default.resolve(DOGU_ROUTINE_WORKSPACE_PATH, checkoutPath);
    logger.info('resolved checkout path', { resolvedCheckoutPath });
    await (0, action_kit_1.checkoutProject)(logger, consoleActionClient, deviceHostClient, resolvedCheckoutPath, branchOrTag, clean, checkoutUrl);
    const workspacePath = resolvedCheckoutPath;
    if (postCommand) {
        logger.info('Running post command...');
        const command = process.platform === 'win32' ? process.env.COMSPEC || 'cmd.exe' : process.env.SHELL || '/bin/sh';
        const args = process.platform === 'win32' ? ['/d', '/s', '/c'] : ['-c'];
        args.push(postCommand);
        logger.info('Running command', { command, args });
        const result = (0, child_process_1.spawnSync)(command, args, {
            stdio: 'inherit',
            cwd: workspacePath,
            env: (0, action_kit_1.newCleanNodeEnv)(),
        });
        logger.verbose?.('Command result', { result });
        if (result.status !== 0) {
            throw new Error(`Post command failed with status ${result.status}`);
        }
    }
});
//# sourceMappingURL=main.js.map