import axios from 'axios';
import {
  FETCH_USER,
  FETCH_SURVEYS
} from './types';

// redux で async を使う時は redux-thunk を利用して async Func を return する
// そして関数内で手動 dispatch する
export const fetchUser = () => async (dispatch) => {
  const res = await axios.get('/api/current_user');
  dispatch({ type: FETCH_USER, payload: res.data });
}

// DB内のUserオブジェクトを更新した後、fetchUserと同じレスポンスを受け取る
// → Redux state 内の Userオブジェクト を更新する（なので FETCH_USERを使いまわしている）
export const handleToken = (token) => async (dispatch) => {
  const res = await axios.post('/api/stripe', token);
  dispatch({ type: FETCH_USER, payload: res.data});
}

export const submitSurvey = (values, history) => async (dispatch) => {
  const res = await axios.post('/api/surveys', values);
  history.push('/surveys');
  dispatch({ type: FETCH_USER, payload: res.data});
}

export const fetchSurveys = () => async (dispatch) => {
  const res = await axios.get('/api/surveys');
  dispatch({ type: FETCH_SURVEYS, payload: res.data });
}
