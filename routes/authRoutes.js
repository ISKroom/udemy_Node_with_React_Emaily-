const passport = require('passport');

module.exports = app => {

  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      res.redirect('/surveys');
    }
  );

  app.get('/api/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};


// '/auth/google' で GoogleOAuth の Permission をユーザーにリクエスト
//  → Permissionが得られたら '/auth/google/callback' にリダイレクト（リダイレクトURIは passport.js で記述）
//  → '/auth/google/callback' にリダイレクトされたら passport.js の passport.use で定義した Callback Function が実行される (passport.authenticate('google') を指す)
//  → (req, res) => { res.redirect('/surveys'); } で '/surveys'にリダイレクト

// passport が自動で logout() を request にアタッチしている（user と同様に）
// → クッキーを削除している ( Set-Cookie: "" を実行している)
