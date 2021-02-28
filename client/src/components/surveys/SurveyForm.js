// SurveyForm shows a form for a user to add input
import _ from 'lodash';
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import SurveyField from './SurveyField';
import { Link } from 'react-router-dom';
import validateEmails from '../../utils/validateEmails';
import formFields from './formFields';

class SurveyForm extends Component {

  renderFields(){
    return _.map(formFields, ({ label, name }) => {
      return (
        <Field component={SurveyField} type="text" label={label} name={name} key={name} />
      );
    });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.props.handleSubmit(this.props.onSurveySubmit)}>
          {this.renderFields()}
          <Link to="/surveys" className="red btn-flat white-text">
            Cancel
          </Link>
          <button className="teal btn-flat right white-text" type="submit">
            Next
            <i className="material-icons right">done</i>
          </button>
        </form>
      </div>
    );
  }
}

function validate(formValues) {
  const errors = {};

  // emailのフォーマットをチェック
  // エラー文字列を上書きしてしまうので空欄チェックより先に実行
  errors.recipients = validateEmails(formValues.recipients || '');

  // 空欄チェック
  // formValues[name] で formValues.title formValues.subject のように参照できる
  _.each(formFields, ({ name }) => {
    if(!formValues[name]) { errors[name] = 'You must provide a value'; }
  });

  return errors;
}

export default reduxForm({
  validate,
  form: 'surveyForm',
  destroyOnUnmount: false
})(SurveyForm);

// destroyOnUnmount: false で SurveyForm.js　がアンマウントしてもフォームの入力内容を保持するようになる
// SurveyForm.js の親コンポーネントである SurveyNew.js で destroyOnUnmount: true （デフォルト）なので、SurveyNew.js がアンマウントするとフォームの入力内容が消去されるように設定してある
