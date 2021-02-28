const sendgrid = require('sendgrid');
const helper = sendgrid.mail;
const keys = require('../config/keys');

// ☆☆☆
// SendGrid の HTTP POST URl に有効な URL を登録すること！
// Dev で Ngrok を使用する場合は URL は8時間で無効になるので都度更新する！
// ☆☆☆

class Mailer extends helper.Mail {

  constructor({ subject, recipients }, content) {
    super();  // helper.Mail のコンストラクタを実行（決まりなので）

    // APIオブジェクト
    this.sgApi = sendgrid(keys.sendGridKey);

    // 各フィールドの初期化
    this.subject = subject;
    this.body = new helper.Content('text/html', content);
    this.recipients = this.formatAddresses(recipients);
    this.from_email = new helper.Email('ikyohei2100@gmail.com');

    // body(メール本文) を Mailer クラスに登録する必要がある
    // addContent は helper.Mail のビルトイン関数
    this.addContent(this.body);

    // メール内のリンクを SendGrid サーバーへのリンクと入れ替えるための設定
    // これによりどのユーザーがリンクをクリックしたかトラッキングできる
    this.addClickTracking();

    // 送信先を Mailer クラスに登録する必要がある
    this.addRecipients();
  }

  formatAddresses(recipients) {
    // recipients はオブジェクトのアレイなので以下のように
    // 文字列(email)だけを取り出して helper.Email(email) のアレイに変換している
    return recipients.map(({ email }) => {
      return new helper.Email(email);
    });
  }

  addClickTracking() {
    const trackingSettings = new helper.TrackingSettings();
    const clickTracking = new helper.ClickTracking(true, true);
    trackingSettings.setClickTracking(clickTracking);
    this.addTrackingSettings(trackingSettings);
  }

  addRecipients() {
    const personalize = new helper.Personalization();
    this.recipients.forEach(recipient => {
      personalize.addTo(recipient);
    });
    this.addPersonalization(personalize);
  }

  async send() {
    const request = this.sgApi.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: this.toJSON()
    });

    // SendGridにメール送信をリクエスト
    const response = await this.sgApi.API(request);
    return response;
  }

}

module.exports = Mailer;

// 上記のような構造になるのは sendgrid の要請なので詳しくはドキュメント参照
// Mailerクラスは複数のemailTamplateで使い回せるように設計（コンストラクタの引数！）
