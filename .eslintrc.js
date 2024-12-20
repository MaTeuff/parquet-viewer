module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
    ],
    plugins: ["react", "@typescript-eslint"],
    settings: {
        react: { version: "detect" }
    },
    rules: {
        // Add custom rules if needed
    }
};