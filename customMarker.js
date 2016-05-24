import React, {PropTypes, Component} from 'react';
import {
  StyleSheet,
  Image
} from 'react-native';

class CustomMarker extends Component {
  render() {
    return (
      <Image
        style={styles.image}
        source={this.props.pressed ? require('./ruby.png') : require('./diamond.png')}
        resizeMode='contain'
      />
    );
  }
};

CustomMarker.PropTypes = {
  pressed: PropTypes.bool,
};

var styles = StyleSheet.create({
  image: {
    height: 40,
    width: 40
  }
});

export defualt CustomMarker;
