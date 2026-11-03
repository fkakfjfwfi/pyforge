"""本地启动 PyForge。

浏览器内 Python 运行时（Pyodide）需要通过 HTTP 加载 WebAssembly，
不能直接双击 index.html 打开。在项目目录执行：

    python serve.py

然后访问 http://localhost:8000
"""

import http.server
import os
import socketserver
import webbrowser

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".wasm": "application/wasm",
        ".json": "application/json",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)


def main():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"PyForge 已启动：{url}")
        print("按 Ctrl+C 停止")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        httpd.serve_forever()


if __name__ == "__main__":
    main()
