import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
// 添加这一行来引入Tailwind CSS (可以放在App导入之后)
import './tailwind.css'; // 这需要稍后创建这个文件
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
