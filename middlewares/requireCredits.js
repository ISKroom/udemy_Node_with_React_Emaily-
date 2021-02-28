module.exports = (req, res, next) => {
  if (req.user.credits < 1) {
    return res.status(403).send({ error: 'Not enough credits!'});
  }
  next();
};

// next → 現在のミドルウェアの処理が完了したら次のミドルウェアに処理の順番を渡す
// 現在のミドルウェアで処理を止めたい場合は return でレスポンスを返す
