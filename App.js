import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
  Platform,
} from 'react-native';
 
import FingerprintScanner from 'react-native-fingerprint-scanner';
import DeviceSettings from 'react-native-device-settings'
import styles from './FingerprintPopup.component.styles';
import ShakingText from './ShakingText.component';
 
 
// - this example component supports both the
//   legacy device-specific (Android < v23) and
//   current (Android >= 23) biometric APIs
// - your lib and implementation may not need both
class BiometricPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessageLegacy: undefined,
      biometricLegacy: undefined,
      isAuthenthicated: false
    };
 
    this.description = null;
  }
 
  componentWillUnmount = () => {
    FingerprintScanner.release();
  }
 
  requiresLegacyAuthentication() {
    return Platform.Version < 23;
  }
 
  authCurrent() {
    FingerprintScanner
      .authenticate({ title: 'Log in with Biometrics' })
      .then(() => {
        this.setState({isAuthenthicated: true})

        Alert.alert("Information", "Fingerprint is successfully authenticated!")
      }).catch(err => {
        FingerprintScanner.release()

        Alert.alert(
          'Information',
          err.toString(),
          // [
          //   {
          //     text: 'Cancel',
          //     onPress: () => console.log('Cancel Pressed'),
          //     style: 'cancel'
          //   },
          //   { text: 'Open Settings', onPress: () => DeviceSettings.open() }
          // ],
          // { cancelable: true }
        )
      })
  }
 
  authLegacy() {
    FingerprintScanner
      .authenticate({ onAttempt: this.handleAuthenticationAttemptedLegacy })
      .then(() => {
        // this.props.handlePopupDismissedLegacy();
        this.setState({isAuthenthicated: true})

        Alert.alert("Information", "Fingerprint is successfully authenticated!")
      })
      .catch((error) => {
        this.setState({ errorMessageLegacy: error.message, biometricLegacy: error.biometric });
        this.description.shake();
      });
  }
 
  handleAuthenticationAttemptedLegacy = (error) => {
    this.setState({ errorMessageLegacy: error.message });
    this.description.shake();
  };
 
  renderLegacy() {
    const { errorMessageLegacy, biometricLegacy } = this.state;
    const { style, handlePopupDismissedLegacy } = this.props;
 
    return (

        <View style={styles.container}>
          <View style={[styles.contentContainer, style]}>
  
            <Image
              style={styles.logo}
              source={require('./assets/finger_print.png')}
            />
  
            <Text style={styles.heading}>
              Biometric{'\n'}Authentication
            </Text>
            <ShakingText
              ref={(instance) => { this.description = instance; }}
              style={styles.description(!!errorMessageLegacy)}>
              {errorMessageLegacy || `Scan your ${biometricLegacy} on the\ndevice scanner to continue`}
            </ShakingText>
  
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handlePopupDismissedLegacy}
            >
              <Text style={styles.buttonText}>
                BACK TO MAIN
              </Text>
            </TouchableOpacity>
  
          </View>
        </View>
    );
  }
 
 
  render = () => {
    if (this.requiresLegacyAuthentication()) {
      return this.renderLegacy();
    }
 
    // current API UI provided by native BiometricPrompt
    return <View
      style = {{
        flex: 1
      }}
    >
      <View
          style = {{
            position: 'absolute',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {
            !this.state.isAuthenthicated ?
              <>
              <TouchableOpacity
              activeOpacity = {0.7}
              onPress = {() => {
                if (this.requiresLegacyAuthentication()) {
                  this.authLegacy();
                } else {
                  this.authCurrent();
                }
              }}
              style = {{
                backgroundColor: 'steelblue',
                borderRadius: 10,
                padding: 20
              }}
            >
              <Text
                style = {{
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                Authenticate Fingerprint
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity = {0.7}
              onPress = {() => {
                DeviceSettings.open()
              }}
              style = {{
                backgroundColor: 'mediumseagreen',
                borderRadius: 10,
                marginTop: 20,
                padding: 20,
                width: 200
              }}
            >
              <Text
                style = {{
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                Open Device Settings To Set Up Fingerprint
              </Text>
            </TouchableOpacity>
            </>
            :
            <TouchableOpacity
              activeOpacity = {0.7}
              onPress = {async() => {
                await this.setState({
                  isAuthenthicated: false
                })

                await FingerprintScanner.release()

                if (this.requiresLegacyAuthentication()) {
                  this.authLegacy();
                } else {
                  this.authCurrent();
                }
              }}
              style = {{
                backgroundColor: 'red',
                borderRadius: 10,
                padding: 20
              }}
            >
              <Text
                style = {{
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                Re-Authenticate Fingerprint
              </Text>
            </TouchableOpacity>
          }
        </View>
    </View>;
  }
}
 
BiometricPopup.propTypes = {
  onAuthenticate: PropTypes.func.isRequired,
  handlePopupDismissedLegacy: PropTypes.func,
  style: ViewPropTypes.style,
};
 
export default BiometricPopup;