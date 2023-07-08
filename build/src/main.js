"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const action_kit_1 = require("@dogu-tech/action-kit");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
action_kit_1.ActionKit.run(async ({ options, logger, input, deviceHostClient, consoleActionClient, deviceClient }) => {
    const { DOGU_DEVICE_WORKSPACE_PATH, DOGU_PROJECT_ID } = options;
    const clean = input.get('clean');
    const branchOrTag = input.get('branchOrTag');
    const postCommand = input.get('postCommand');
    const optionsConfig = await action_kit_1.OptionsConfig.load();
    if (optionsConfig.get('localUserProject.use', false)) {
        logger.info('Using local user project...');
    }
    else {
        await (0, action_kit_1.checkoutProject)(logger, consoleActionClient, deviceHostClient, DOGU_DEVICE_WORKSPACE_PATH, DOGU_PROJECT_ID, branchOrTag, clean);
        const deviceProjectWorkspacePath = action_kit_1.HostPaths.deviceProjectWorkspacePath(DOGU_DEVICE_WORKSPACE_PATH, DOGU_PROJECT_ID);
        await fs_1.default.promises.mkdir(deviceProjectWorkspacePath, { recursive: true });
        const deviceProjectGitPath = action_kit_1.HostPaths.deviceProjectGitPath(deviceProjectWorkspacePath);
        if (postCommand) {
            logger.info('Running post command...');
            const command = process.platform === 'win32' ? process.env.COMSPEC || 'cmd.exe' : process.env.SHELL || '/bin/sh';
            const args = process.platform === 'win32' ? ['/d', '/s', '/c'] : ['-c'];
            args.push(postCommand);
            logger.info('Running command', { command, args });
            const result = (0, child_process_1.spawnSync)(postCommand, {
                stdio: 'inherit',
                cwd: deviceProjectGitPath,
                env: (0, action_kit_1.newCleanNodeEnv)(),
            });
            logger.verbose?.('Command result', { result });
            if (result.status !== 0) {
                throw new Error(`Post command failed with status ${result.status}`);
            }
        }
    }
});
//# sourceMappingURL=main.js.map