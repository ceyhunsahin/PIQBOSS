// Monorepo (npm workspaces) için Metro yapılandırması.
// Workspace kökünü izler ve hoist edilen node_modules'ı çözer.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
