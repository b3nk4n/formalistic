import {freeze, isStrictReferenceEqual, emptyObject} from './util';
import {alwaysValid, noValidationErrors} from './validator';
import {getMaxSeverity} from './severity';

export default function createField(opts) {
  return new Field(opts || emptyObject);
}

class Field {
  constructor(opts) {
    // value handling
    this.value = opts.value;
    if ('pristineValue' in opts) {
      this.pristineValue = opts.pristineValue;
    } else {
      this.pristineValue = this.value;
    }

    // dirty state
    this.isEqual = opts.isEqual || isStrictReferenceEqual;
    this.changed = !this.isEqual(this.value, this.pristineValue);
    this.touched = 'touched' in opts ? Boolean(opts.touched) : false;

    // validation
    this.validator = opts.validator || alwaysValid;
    this.messages = freeze(this.validator(this.value) || noValidationErrors);
    this.maxSeverity = getMaxSeverity(this.messages);
    this.valid = this.maxSeverity !== 'error';

    freeze(this);
  }

  setValue(value) {
    if (this.isEqual(value, this.value)) {
      return this;
    }

    return new Field({
      value: value,
      pristineValue: this.pristineValue,
      isEqual: this.isEqual,
      touched: this.touched,
      validator: this.validator
    });
  }

  setTouched(touched) {
    return new Field({
      value: this.value,
      pristineValue: this.pristineValue,
      isEqual: this.isEqual,
      touched: touched,
      validator: this.validator
    });
  }

  toJS() {
    return this.value;
  }

  map(mapper) {
    return mapper(this);
  }
}