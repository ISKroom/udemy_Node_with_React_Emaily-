import { FETCH_USER } from '../actions/types';

export default function(state = null, action) {
  switch (action.type) {
    case FETCH_USER: // payload (Userオブジェクト) が empty だったら false を return
      return action.payload || false;
    default:
      return state;
  }
}
