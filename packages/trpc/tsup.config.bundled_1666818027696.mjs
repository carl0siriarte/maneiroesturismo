// tsup.config.ts
import { config } from "dotenv";
import { defineConfig } from "tsup";
config({
  path: "../../.env"
});
var isProduction = process.env.NODE_ENV === "production";
var tsup_config_default = defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node16",
  minify: isProduction,
  sourcemap: true,
  dts: true
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGNvbmZpZyB9IGZyb20gJ2RvdGVudidcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3RzdXAnXG5cbmNvbmZpZyh7XG4gIHBhdGg6ICcuLi8uLi8uZW52Jyxcbn0pXG5cbmNvbnN0IGlzUHJvZHVjdGlvbiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbidcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgZW50cnk6IFsnc3JjL2luZGV4LnRzJ10sXG4gIGZvcm1hdDogWydlc20nXSxcbiAgdGFyZ2V0OiAnbm9kZTE2JyxcbiAgbWluaWZ5OiBpc1Byb2R1Y3Rpb24sXG4gIHNvdXJjZW1hcDogdHJ1ZSxcbiAgZHRzOiB0cnVlLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxTQUFTLGNBQWM7QUFDdkIsU0FBUyxvQkFBb0I7QUFFN0IsT0FBTztBQUFBLEVBQ0wsTUFBTTtBQUNSLENBQUM7QUFFRCxJQUFNLGVBQWUsUUFBUSxJQUFJLGFBQWE7QUFFOUMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTyxDQUFDLGNBQWM7QUFBQSxFQUN0QixRQUFRLENBQUMsS0FBSztBQUFBLEVBQ2QsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsV0FBVztBQUFBLEVBQ1gsS0FBSztBQUNQLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
