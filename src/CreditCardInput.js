import React, { Component } from "react";
import ReactNative, {
  NativeModules,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ViewPropTypes
} from "react-native";
import PropTypes from "prop-types";

import CreditCard from "react-native-credit-card";
import CCInput from "./CCInput";
import { removeNonNumber } from "./Utilities";
import { InjectedProps } from "./connectToState";

const s = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  form: {
    marginTop: 20,
  },
});

const CVC_INPUT_WIDTH = 70;
const EXPIRY_INPUT_WIDTH = CVC_INPUT_WIDTH;
const CARD_NUMBER_INPUT_WIDTH_OFFSET = 40;
const CARD_NUMBER_INPUT_WIDTH = Dimensions.get("window").width - EXPIRY_INPUT_WIDTH - CARD_NUMBER_INPUT_WIDTH_OFFSET;
const NAME_INPUT_WIDTH = CARD_NUMBER_INPUT_WIDTH;
const PREVIOUS_FIELD_OFFSET = 40;
const POSTAL_CODE_INPUT_WIDTH = 120;

/* eslint react/prop-types: 0 */ // https://github.com/yannickcr/eslint-plugin-react/issues/106
export default class CreditCardInput extends Component {
  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,

    cardViewSize: PropTypes.object,
    imageFront: PropTypes.number,
    imageBack: PropTypes.number,
    labelStyle: Text.propTypes.style,
    inputStyle: Text.propTypes.style,
    inputContainerStyle: ViewPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,
    bgColor: PropTypes.string,
  };

  componentDidMount = () => this._focus(this.props.focused);

  componentWillReceiveProps = newProps => {
    if (this.props.focused !== newProps.focused) this._focus(newProps.focused);
  };

  _focus = field => {
    if (!field) return;

    const scrollResponder = this.refs.Form.getScrollResponder();
    const nodeHandle = ReactNative.findNodeHandle(this.refs[field]);

    NativeModules.UIManager.measureLayoutRelativeToParent(nodeHandle,
      e => { throw e; },
      x => {
        scrollResponder.scrollTo({ x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0), animated: true });
        this.refs[field].focus();
      });
  }

  _inputProps = field => {
    const {
      inputStyle, labelStyle, validColor, invalidColor, placeholderColor,
      placeholders, labels, values, status,
      onFocus, onChange, onBecomeEmpty, onBecomeValid,
    } = this.props;

    return {
      inputStyle, labelStyle, validColor, invalidColor, placeholderColor,
      ref: field, field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus, onChange, onBecomeEmpty, onBecomeValid,
    };
  };

  render() {
    const {
      imageFront, imageBack, cardViewSize, inputContainerStyle, bgColor,
      values: { number, expiry, cvc, name }, focused,
      requiresName, requiresCVC, requiresPostalCode,
    } = this.props;

    return (
      <View style={s.container}>
        <CreditCard focused={focused}
            {...cardViewSize}
            bgColor={bgColor}
            imageFront={imageFront}
            imageBack={imageBack}
            name={requiresName ? name : " " }
            number={removeNonNumber(number)}
            expiry={expiry}
            cvc={cvc}
            shiny={false}
            clickable={false}
            bar />
        <ScrollView ref="Form"
            horizontal
            keyboardShouldPersistTaps
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={s.form}>
          <CCInput {...this._inputProps("number")}
              containerStyle={[inputContainerStyle, { width: CARD_NUMBER_INPUT_WIDTH }]} />
          <CCInput {...this._inputProps("expiry")}
              containerStyle={[inputContainerStyle, { width: EXPIRY_INPUT_WIDTH }]} />
          { requiresCVC &&
            <CCInput {...this._inputProps("cvc")}
                containerStyle={[inputContainerStyle, { width: CVC_INPUT_WIDTH }]} /> }
          { requiresName &&
            <CCInput {...this._inputProps("name")}
                keyboardType="default"
                containerStyle={[inputContainerStyle, { width: NAME_INPUT_WIDTH }]} /> }
          { requiresPostalCode &&
            <CCInput {...this._inputProps("postalCode")}
                containerStyle={[inputContainerStyle, { width: POSTAL_CODE_INPUT_WIDTH }]} /> }
        </ScrollView>
      </View>
    );
  }
}

CreditCardInput.defaultProps = {
  cardViewSize: {},
  labels: {
    name: "CARDHOLDER'S NAME",
    number: "CARD NUMBER",
    expiry: "EXPIRY",
    cvc: "CVC/CCV",
    postalCode: "POSTAL CODE",
  },
  placeholders: {
    name: "Full Name",
    number: "1234 5678 1234 5678",
    expiry: "MM/YY",
    cvc: "CVC",
    postalCode: "34567",
  },
  inputContainerStyle: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  validColor: "",
  invalidColor: "red",
  placeholderColor: "gray",
};
