// Source: https://github.com/react-community/react-native-platform-touchable
import React, { ReactNode } from 'react'
import {
  BackgroundPropType,
  Platform,
  StyleProp,
  TouchableNativeFeedback,
  TouchableNativeFeedbackProperties,
  TouchableNativeFeedbackStatic,
  TouchableOpacity,
  TouchableOpacityProperties,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native'

interface TouchableMethods {
  Ripple: TouchableNativeFeedbackStatic['Ripple'] | (() => {})
  SelectableBackground:
    | TouchableNativeFeedbackStatic['SelectableBackground']
    | (() => {})
  SelectableBackgroundBorderless:
    | TouchableNativeFeedbackStatic['SelectableBackgroundBorderless']
    | (() => {})
  canUseNativeForeground: () => boolean
}

const defaultTouchableMethods: TouchableMethods = {
  Ripple: () => ({}),
  SelectableBackground: () => ({}),
  SelectableBackgroundBorderless: () => ({}),
  canUseNativeForeground: () => false,
}

const TouchableOpacityWithMethods = Object.assign(
  {},
  defaultTouchableMethods,
  TouchableOpacity,
  { displayName: 'TouchableOpacity' },
)

const TouchableWithoutFeedbackWithMethods = Object.assign(
  {},
  defaultTouchableMethods,
  TouchableWithoutFeedback,
  { displayName: 'TouchableWithoutFeedback' },
)

let TouchableComponent:
  | typeof TouchableOpacityWithMethods
  | typeof TouchableWithoutFeedbackWithMethods

TouchableComponent =
  Platform.OS === 'android' && Platform.Version > 20
    ? TouchableWithoutFeedbackWithMethods
    : TouchableOpacityWithMethods

export interface PlatformTouchableProperties
  extends TouchableNativeFeedbackProperties,
    TouchableOpacityProperties {
  background?: BackgroundPropType
  children: ReactNode
  foreground?: BackgroundPropType
  style?: StyleProp<ViewStyle>
  useForeground?: boolean
}

export default class PlatformTouchable extends React.PureComponent<
  PlatformTouchableProperties
> {
  static Ripple = TouchableComponent.Ripple
  static SelectableBackground = TouchableComponent.SelectableBackground
  static SelectableBackgroundBorderless = TouchableComponent.SelectableBackgroundBorderless
  static canUseNativeForeground = TouchableComponent.canUseNativeForeground

  render() {
    const {
      background,
      children: _children,
      foreground,
      style,
      useForeground: _useForeground,
      ...props
    } = this.props

    // Even though it works for TouchableWithoutFeedback and
    // TouchableNativeFeedback with this component, we want
    // the API to be the same for all components so we require
    // exactly one direct child for every touchable type.
    const children = React.Children.only(_children)

    let useForeground = _useForeground
    if (TouchableComponent === TouchableNativeFeedback) {
      useForeground =
        !!foreground && TouchableNativeFeedback.canUseNativeForeground()

      if (foreground && background) {
        // tslint:disable-next-line no-console
        console.warn(
          'Specified foreground and background for Touchable, only one can be used at a time. Defaulted to foreground.',
        )
      }

      return (
        <TouchableNativeFeedback
          {...props}
          useForeground={useForeground}
          background={(useForeground && foreground) || background}
        >
          <View style={style}>{children}</View>
        </TouchableNativeFeedback>
      )
    }

    else {
      return (
        <TouchableOpacity {...props} style={style}>
          {children}
        </TouchableOpacity>
      )
    }
  }
}