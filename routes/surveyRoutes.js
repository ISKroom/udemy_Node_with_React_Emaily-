const _ = require('lodash');
const { Path } = require('path-parser');
const { URL } = require('url'); // Nodejsのビルトインライブラリ
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate')

const Survey = mongoose.model('surveys');

module.exports = app => {

  // ログインユーザーが作成した Survey の一覧を表示する
  // Survey のサブドキュメント（recipients）は持ってこないように注意
  app.get('/api/surveys', requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id })
                                .select({ recipients: false });
    res.send(surveys);
  });

  app.get('/api/surveys/:surveyId/:choice', (req,res) => {
    res.send('Thanks for voting!');
    // 講義の都合上ブラウザに文字列を表示するだけ
    // /api/surveys における Survey にリダイレクトURLのフィールドを持たせてそこにリダイレクトするのもよい
  })


  app.post('/api/surveys/webhooks', (req, res) => {
    const p = new Path('/api/surveys/:surveyId/:choice');

    // 1. SendGridから送信されたイベントオブジェクトのアレイを { email, surveyId, choice } のアレイに変換する（変換できなかったら undefined とする）
    // 2. undefined を除外する
    // 3. email と surveyId が同時に重複しているオブジェクトを除外する
    // 4. Surveyの yes/no を更新 + ユーザーの responded を true に変更
    // 　 クエリで対象のレコードを発見＆更新している（コレクション全部持って来て find するのは超重いのでNG）
    //  　既に回答してるユーザーは無視している
    //    async 処理だけど特に何かをレスポンスする必要ないので await していない
    _.chain(req.body)
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname);
        if(match){
          return { email, surveyId: match.surveyId, choice: match.choice };
        }
      })
      .compact()
      .uniqBy('email', 'surveyId')
      .each(({ surveyId, email, choice }) => {
        Survey.updateOne({
          _id: surveyId,
          recipients: {
            $elemMatch: { email: email, responded: false }
          }
        }, {
          $inc: { [choice]: 1},
          $set: { 'recipients.$.responded': true },
          lastResponded: new Date()
        }).exec()
      })
      .value();

    // レスポンスを返さないとSendGridがリクエストを繰り返してしまうので注意
    res.send({});
  });


  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;
    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients.split(',').map(email => ({ email: email.trim(), responded: false })),
      _user: req.user.id,
      dateSent: Date.now()
    });

    try {
      // メール送信
      const mailer = new Mailer(survey, surveyTemplate(survey));
      await mailer.send();

      // メールの送信に成功したら Survey を DB に保存する
      await survey.save();

      // クレジットをマイナス1して DB内の User を更新
      req.user.credits -= 1;
      const user = await req.user.save();

      // ActionCreator にレスポンスを返す（Redux内の User も更新される）
      res.send(user);

    } catch (err) {
      res.status(422).send(err);
    }
  });

};

// req.body.recipients はカンマ区切りの文字列(email)であるように設計している
