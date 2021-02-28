const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const requireLogin = require('../middlewares/requireLogin');

module.exports = app => {

  // body-parser ミドルウェアを使用しているので req.body にアクセスできる
  // Express はミドルウェアなしにPOSTリクエストのボディにアクセスできない
  app.post('/api/stripe', requireLogin, async (req,res) => {

    // 決済を実行
    const charge = await stripe.charges.create({
                            amount: 500,
                            currency: 'usd',
                            description: '$5 for 5 credits',
                            source: req.body.id
                          });

    // DB内の User を更新
    // passportミドルウェアによって(ログイン済みなら) req.user に現在のユーザー情報が付与されている
    // ログイン済みかどうかは requireLogin ミドルウェア でチェックしている
    req.user.credits += 5;
    const user = await req.user.save();

    // 最新の User をフロントエンドに返す
    // この User は ActionCreator で dispatch されるのでフロントも自動で更新される
    res.send(user);

  });

};
