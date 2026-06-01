const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add ONNX model support
config.resolver.assetExts.push("onnx");

module.exports = withNativewind(config);
