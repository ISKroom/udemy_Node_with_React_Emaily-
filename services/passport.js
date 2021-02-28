const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

// serializeUser は passport.use の callback関数が done() を実行したら自動で Call される
// 第一引数の user は passport.use の callback関数内 done() の第二引数を指す
// user.id は MongoDB が自動で生成した文字列なので googleId とは違うことに注意
// ブラウザに set-Cookie: user.id のヘッダーを含んだレスポンスを自動で返す
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserializeUser はブラウザのリクエストに際して自動で実行される
// クッキーから token を取得（ token は serializeUser で定義した user.id の想定 ）
// token は deserializeUser の第一引数で与えられる
// done(null, user) で リクエストオブジェクトに req.user の形で情報を付与している（ req は route handler に渡される）
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user));
});


passport.use(
  new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true // proxiを介したリクエストも許可する（デプロイ後のhttp/httpsの違いを考慮）
  },
  async (accessToken, refreshToken, profile, done) => {

    const existingUser = await User.findOne({ googleId: profile.id })

    if(existingUser) {
      // We already have a record with the given profile ID
      done(null, existingUser);
    } else {
      // We don't have a user record with this ID, make a new record
      const user = await new User({ googleId: profile.id }).save()
      done(null, user);
    }
  })
);

// passport.use の callback関数 が done() → serializeUser が実行
// serializeUser が done() → ブラウザに Cookie を設定して Authentication Flow が完了

// DB接続時は必ず Promise/async と同じように扱う
// passport の想定処理が完了したら done( errorObject, successObject) を実行する必要がある
// 言い換えると、done() を実行することで Authenticatation Flow の次のステップに進む
// エラーが発生する可能性がない場合 errorObject は null でよい

// googleId はユーザーの照合のみに使われており、ユーザーの確認が取れたら、以降は MongoDB が生成するuserIdを使用する。
