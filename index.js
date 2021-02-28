const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const keys = require('./config/keys');

// 以下、対象のファイル内で何も export してないのでファイルの中身をそのまま取り込んでいる
// ./services/passport で Userモデルを使用するので先に ./models/User をインポートする必要がある
require('./models/User');
require('./models/Survey');
require('./services/passport');

// Connect MongoDB
mongoose.connect(keys.mongoURI);

// Start Express App
const app = express();

// ミドルウェアの使用を指示（ app.use がその指示にあたる）（req.body にアクセスできるようにしている）
app.use(bodyParser.json());

// Express に Cookie の使用を指示
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days (ms 単位)
    keys: [keys.cookieKey] // cookie を暗号化するためのキーを指定
  })
);

// Authentication に Cookie の使用を指示
app.use(passport.initialize());
app.use(passport.session());

// Routes (各 Route が必要としている app を渡している)
require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);
require('./routes/surveyRoutes')(app);

//
if (process.env.NODE_ENV === 'production') {
  // Express will serve up production assets like our main.js file, or main.css file!
  // client/build... に対するリクエストには prod assets を返す
  app.use(express.static('client/build'));

  // Express will serve up index.html file if it doesn't recognize the route
  // 上記の Route 全てにマッチしないリクエストに対して index.html を返す
  // 上記どれかの Route にマッチしたら処理はそこで止まるのでこの処理まで到達しない
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname,'client','build','index.html'));
  })
}

// Port Bind
const PORT = process.env.PORT || 5000; // デプロイ時の環境変数が存在すればそちらを使用する
app.listen(PORT);
