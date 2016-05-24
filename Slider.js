'use strict';

import React, {PropTypes, Component} from 'react';
import {
  StyleSheet,
  PanResponder,
  View,
  TouchableHighlight
} from 'react-native';

import converter  from './converter.js';
import mockProps from './mockProps.js';

class Slider extends Component {
  constructor(props) {
    super(props);
    this.optionsArray = this.props.optionsArray || converter.createArray(this.props.min,this.props.max,this.props.step);
    this.stepLength = this.props.sliderLength/this.optionsArray.length;

    var initialValues = this.props.values.map(value => converter.valueToPosition(value,this.optionsArray,this.props.sliderLength));

    this.state = {
      pressedOne: true,
      valueOne: this.props.values[0],
      valueTwo: this.props.values[1],
      pastOne: initialValues[0],
      pastTwo: initialValues[1],
      positionOne: initialValues[0],
      positionTwo: initialValues[1]
    };
  }

  componentWillMount() {
    var customPanResponder = function (start, move, end) {
      return PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
        onPanResponderGrant: (evt, gestureState) => start(),
        onPanResponderMove: (evt, gestureState) => move(gestureState),
        onPanResponderTerminationRequest: (evt, gestureState) => true,
        onPanResponderRelease: (evt, gestureState) => end(gestureState),
        onPanResponderTerminate: (evt, gestureState) => end(gestureState),
        onShouldBlockNativeResponder: (evt, gestureState) => true
      })
    };

    this._panResponderOne = customPanResponder(this.startOne.bind(this), this.moveOne.bind(this), this.endOne.bind(this));
    this._panResponderTwo = customPanResponder(this.startTwo.bind(this), this.moveTwo.bind(this), this.endTwo.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    var { values } = this.props;
    if (nextProps.values.join() !== values.join()) {
      this.set(nextProps);
    }
  }

  set(config) {
    var { max, min, optionsArray, step, values } = config || this.props;
    this.optionsArray = optionsArray || converter.createArray(min, max, step);
    this.stepLength = this.props.sliderLength/this.optionsArray.length;

    var initialValues = values.map(value => converter.valueToPosition(value,this.optionsArray,this.props.sliderLength));

    this.setState({
      pressedOne: true,
      valueOne: values[0],
      valueTwo: values[1],
      pastOne: initialValues[0],
      pastTwo: initialValues[1],
      positionOne: initialValues[0],
      positionTwo: initialValues[1]
    });
  }

  startOne () {
    this.props.onValuesChangeStart();
    this.setState({
      onePressed: !this.state.onePressed
    });
  }

  startTwo () {
    this.props.onValuesChangeStart();
    this.setState({
      twoPressed: !this.state.twoPressed
    });
  }

  moveOne(gestureState) {
    var unconfined = gestureState.dx + this.state.pastOne;
    var bottom     = 0;
    var top        = (this.state.positionTwo - this.stepLength) || this.props.sliderLength;
    var confined   = unconfined < bottom ? bottom : (unconfined > top ? top : unconfined);
    var value      = converter.positionToValue(this.state.positionOne, this.optionsArray, this.props.sliderLength);

    var slipDisplacement = this.props.touchDimensions.slipDisplacement;

    if (Math.abs(gestureState.dy) < slipDisplacement || !slipDisplacement) {
      this.setState({
        positionOne: confined
      });
    }
    if ( value !== this.state.valueOne ) {
      this.setState({
        valueOne: value
      }, function () {
        var change = [this.state.valueOne];
        if (this.state.valueTwo) {
          change.push(this.state.valueTwo);
        }
        this.props.onValuesChange(change);
      });
    }
  }

  moveTwo(gestureState) {
    var unconfined  = gestureState.dx + this.state.pastTwo;
    var bottom      = this.state.positionOne + this.stepLength;
    var top         = this.props.sliderLength;
    var confined    = unconfined < bottom ? bottom : (unconfined > top ? top : unconfined);
    var value       = converter.positionToValue(this.state.positionTwo, this.optionsArray, this.props.sliderLength);
    var slipDisplacement = this.props.touchDimensions.slipDisplacement;

    if (Math.abs(gestureState.dy) < slipDisplacement || !slipDisplacement) {
      this.setState({
        positionTwo: confined
      });
    }
    if ( value !== this.state.valueTwo ) {
      this.setState({
        valueTwo: value
      }, function () {
        this.props.onValuesChange([this.state.valueOne,this.state.valueTwo]);
      });
    }
  }

  endOne(gestureState) {
    this.setState({
      pastOne: this.state.positionOne,
      onePressed: !this.state.onePressed
    }, function () {
      var change = [this.state.valueOne];
      if (this.state.valueTwo) {
        change.push(this.state.valueTwo);
      }
      this.props.onValuesChangeFinish(change);
    });
  }

  endTwo(gestureState) {
    this.setState({
      twoPressed: !this.state.twoPressed,
      pastTwo: this.state.positionTwo,
    }, function () {
      this.props.onValuesChangeFinish([this.state.valueOne,this.state.valueTwo]);
    });
  }

  render() {
    const {positionOne, positionTwo} = this.state;
    const {selectedStyle, unselectedStyle, sliderLength} = this.props;
    const twoMarkers = positionTwo;
    const trackOneLength = positionOne;
    const trackOneStyle = twoMarkers ? unselectedStyle : selectedStyle;
    const trackThreeLength = twoMarkers ? sliderLength - (positionTwo) : 0;
    const trackThreeStyle = unselectedStyle;
    const trackTwoLength = sliderLength - trackOneLength - trackThreeLength;
    const trackTwoStyle = twoMarkers ? selectedStyle : unselectedStyle;
    const Marker = this.props.customMarker;
    const {slipDisplacement, height, width, borderRadius} = this.props.touchDimensions;
    const touchStyle = {
      height: height,
      width: width,
      top: -height / 2 + 3,
      left: -width / 2,
      borderRadius: borderRadius || 0
    };


    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <View style={[styles.fullTrack, {width: sliderLength}]}>
          <View style={[this.props.trackStyle, styles.track, trackOneStyle, {width: trackOneLength}]} />
          <View style={[this.props.trackStyle, styles.track, trackTwoStyle, {width: trackTwoLength}]} />
          <View style={[this.props.trackStyle, styles.track, trackThreeStyle, {width: trackThreeLength}]} />
          <View
            style={[styles.touch, touchStyle, {left: positionOne - width / 2}]}
            ref={component => this._markerOne = component}
            {...this._panResponderOne.panHandlers}
          >
            <Marker
              pressed={this.state.onePressed}
              markerStyle={this.props.markerStyle}
              pressedMarkerStyle={this.props.pressedMarkerStyle}
            />
          </View>
          <View
            style={[styles.touch, touchStyle, {left: positionTwo - width / 2}]}
            ref={component => this._markerTwo = component}
            {...this._panResponderTwo.panHandlers}
          >
            <Marker
              pressed={this.state.twoPressed}
              markerStyle={this.props.markerStyle}
              pressedMarkerStyle={this.props.pressedMarkerStyle}
            />
          </View>
        </View>
      </View>
    );
  }
};

Slider.PropTypes = {
  values: PropTypes.arrayOf(PropTypes.number),

  onValuesChangeStart: PropTypes.func,
  onValuesChange: PropTypes.func,
  onValuesChangeFinish: PropTypes.func,

  sliderLength: PropTypes.number,
  sliderOrientation: PropTypes.string,
  touchDimensions: PropTypes.object,

  customMarker: PropTypes.func,

  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,

  optionsArray: PropTypes.array,

  containerStyle: View.propTypes.style,
  trackStyle: View.propTypes.style,
  selectedStyle: View.propTypes.style,
  unselectedStyle: View.propTypes.style,
  markerStyle: View.propTypes.style,
  pressedMarkerStyle: View.propTypes.style
};

Slider.defaultProps = mockProps;

export default Slider;

var styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  fullTrack: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  track: {
    justifyContent: 'center',
  },
  touch: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  }
});
