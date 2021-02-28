const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    ["/api", "/auth/google"],
    createProxyMiddleware({
      target: "http://localhost:5000",
    })
  );
};

// Note - anytime you make a change to the setupProxy file you'll need to restart your server.
// There is no need to import this file anywhere, CRA (Create React App) looks for a file by this name and loads it.

// Reactサーバーに対するリクエスト http://localhost:3000/auth/google が発生したら
// http://localhost:5000/auth/google にリダイレクトしている

// プロキシ設定は開発時にのみ必要（本番環境では Create-React-Appサーバー は存在しないので）
