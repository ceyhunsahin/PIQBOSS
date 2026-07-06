const fs = require("fs");
const path = require("path");

function resolveServiceFile(envVarName, repoRelativePath) {
  const envPath = process.env[envVarName];
  if (envPath && fs.existsSync(envPath)) {
    return envPath;
  }

  const localAbsolutePath = path.join(__dirname, repoRelativePath);
  if (fs.existsSync(localAbsolutePath)) {
    return repoRelativePath;
  }

  return undefined;
}

module.exports = ({ config }) => {
  const iosGoogleServicesFile = resolveServiceFile(
    "GOOGLE_SERVICE_INFO_PLIST",
    "./GoogleService-Info.plist"
  );
  const androidGoogleServicesFile = resolveServiceFile(
    "GOOGLE_SERVICES_JSON",
    "./google-services.json"
  );
  const isEasBuild = process.env.EAS_BUILD === "true";

  if (isEasBuild && !iosGoogleServicesFile) {
    throw new Error(
      "Missing iOS Firebase config. Set GOOGLE_SERVICE_INFO_PLIST as an EAS file secret."
    );
  }

  if (isEasBuild && !androidGoogleServicesFile) {
    throw new Error(
      "Missing Android Firebase config. Set GOOGLE_SERVICES_JSON as an EAS file secret."
    );
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      ...(iosGoogleServicesFile
        ? { googleServicesFile: iosGoogleServicesFile }
        : {}),
    },
    android: {
      ...config.android,
      ...(androidGoogleServicesFile
        ? { googleServicesFile: androidGoogleServicesFile }
        : {}),
    },
  };
};
