import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0b0c10",
                foreground: "#f3f4f6",
                brand: {
                    red: "#e63946",
                    "red-hover": "#d62828",
                },
                card: {
                    bg: "rgba(23, 25, 35, 0.4)",
                    border: "rgba(255, 255, 255, 0.08)",
                },
                primary: {
                    DEFAULT: "#e63946",
                    foreground: "#ffffff",
                },
                input: {
                    bg: "#1a1c23",
                    border: "#2d3748",
                    focus: "#e63946",
                }
            },
            fontFamily: {
                sans: ["var(--font-cairo)", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            }
        },
    },
    plugins: [],
};
export default config;
