import React from 'react';
import {
  View,
  Text,
  Image,
  Slider,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
    StatusBar
} from 'react-native';
import PropTypes from 'prop-types';
import Video from 'react-native-video';
import Orientation from "react-native-orientation";

const screenWidth = Dimensions.get('window').width;
const defaultVideoHeight = screenWidth * 9/16;

export default class VideoPlayer extends React.Component {

  static propTypes = {
    onChangeOrientation: PropTypes.func,
    onTapBackButton: PropTypes.func
  };

  static defaultProps = {
    videoWidth: screenWidth,    // 默认视频宽度，竖屏下为屏幕宽度
    videoHeight: defaultVideoHeight, // 默认视频高度，竖屏下为宽度的9/16，使视频保持16：9的宽高比
    videoURL: '',    // 视频的地址
    videoCover: '',  // 视频的封面图地址
    videoTitle: '',  // 视频的标题
    enableSwitchScreen: true, // 是否允许视频切换大小
    tag: 0
  };

  constructor(props) {
    super(props);
    let hasCover = true;
    if (!this.props.videoCover) {
          hasCover = false;
      }
    this.state = {
      videoWidth: screenWidth,
      videoHeight: defaultVideoHeight,
      videoUrl: this.props.videoURL,
      videoCover: this.props.videoCover,
      videoTitle: this.props.videoTitle,
      hasCover: hasCover, // 是否有视频封面
      isPaused: true,  // 是否暂停，控制视频的播放和暂停
      duration: 0,     // 视频的时长
      currentTime: 0,  // 视屏当前播放的时间
      isFullScreen: false, // 是否全屏
      isShowControl: false, // 是否显示播放的工具栏
      isShowVideoCover: hasCover, // 是否显示视频封面
      playFromBeginning: false, // 视频是否需要从头开始播放
      isMuted: false,  // 是否静音
      volume: 1.0,   // 音量大小
      playRate: 1.0, // 播放速率
      lastSingleTapTime: 0,   //上次单点击视频区域的时间
    }
  }

  render() {
    return (
      <View
        style={[{width: this.state.videoWidth, height: this.state.videoHeight,backgroundColor:'#000'}, this.props.style]}>
          <Video
          ref={(ref) => { this.videoRef = ref }}
          source={{uri: this.state.videoUrl}}
          resizeMode="contain"
          rate={1.0}
          volume={1.0}
          muted={false}
          ignoreSilentSwitch={"ignore"}
          style={{width: this.state.videoWidth, height: this.state.videoHeight}}
          paused={this.state.isPaused}
          onLoadStart={this._onLoadStart}
          onBuffer={this._onBuffering}
          onLoad={this._onLoad}
          onProgress={this._onProgressChange}
          onEnd={this._onPlayEnd}
          onError={this._onPlayError}
          playInBackground={false}
          playWhenInactive={false}
        />
        {
          this.state.hasCover && this.state.isShowVideoCover ?
            <Image
              style={{position: 'absolute', top: 0, left: 0, width: this.state.videoWidth, height: this.state.videoHeight}}
              source={{uri: this.state.videoCover}}
            /> : null
        }
        <TouchableWithoutFeedback onPress={this._onTapVideo}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: this.state.videoWidth,
              height: this.state.videoHeight,
              backgroundColor: this.state.isPaused ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
              alignItems:'center',
              justifyContent:'center'
            }}>
            {
              this.state.isPaused ?
                <TouchableWithoutFeedback onPress={this._onTapPlayButton}>
                  <Image
                    style={styles.playButton}
                    source={require('../../assets/images/icon_video_play.png')}
                  />
                </TouchableWithoutFeedback> : null
            }
          </View>
        </TouchableWithoutFeedback>
        {
          this.state.isShowControl ?
            <View style={[styles.bottomControl, {width: this.state.videoWidth}]}>
              <Image
                source={require('../../assets/images/img_bottom_shadow.png')}
                style={{position:'absolute', top: 0, left: 0, width: this.state.videoWidth, height:50}}
              />
              <TouchableOpacity activeOpacity={0.3} onPress={this._onTapPlayButton}>
                <Image
                  style={styles.control_play_btn}
                  source={this.state.pause ? require('../../assets/images/icon_control_play.png') : require('../../assets/images/icon_control_pause.png')}
                />
              </TouchableOpacity>
              <Text style={styles.timeText}>{formatTime(this.state.currentTime)}</Text>
              <Slider
                style={{flex: 1}}
                maximumTrackTintColor={'#999999'}//滑块右侧轨道的颜色
                minimumTrackTintColor={'#00c06d'}//滑块左侧轨道的颜色
                thumbImage={require('../../assets/images/icon_control_slider.png')}
                value={this.state.currentTime}
                minimumValue={0}
                maximumValue={Number(this.state.duration)}
                onValueChange={this._onSliderValueChange}
              />
              <Text style={styles.timeText}>{formatTime(this.state.duration)}</Text>
              {
                this.props.enableSwitchScreen ?
                  <TouchableOpacity activeOpacity={0.3} onPress={this._onTapSwitchButton}>
                    <Image
                      style={styles.control_switch_btn}
                      source={this.state.isFullScreen ? require('../../assets/images/icon_control_shrink_screen.png') : require('../../assets/images/icon_control_full_screen.png')}
                    />
                  </TouchableOpacity> : null
              }
            </View> : null
        }
        {
          this.state.isFullScreen && this.state.isShowControl ?
            <View
              style={{
                position:'absolute',
                top: 0,
                left: 0,
                width: this.state.videoWidth,
                height: 50,
                flexDirection:'row',
                alignItems:'center'
              }}>
              <Image
                source={require('../../assets/images/img_top_shadow.png')}
                style={{position:'absolute', top: 0, left: 0, width: this.state.videoWidth, height:50}}
              />
              <TouchableOpacity style={styles.backButton} onPress={this._onTapBackButton}>
                <Image
                  source={require('../../assets/images/icon_back.png')}
                  style={{width: 26, height: 26}}
                />
              </TouchableOpacity>
              <Text style={styles.videoTitle}>{this.state.videoTitle}</Text>
            </View> : null
        }
        {
          this.state.isFullScreen ? null :
            <TouchableOpacity
              style={{
                position:'absolute',
                top: 10,
                left: 10,
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={this._onTapBackButton}
            >
              <Image
                source={require('../../assets/images/icon_back.png')}
                style={{width: 26, height: 26}}
              />
            </TouchableOpacity>
        }
      </View>
    )
  }

  /// -------播放器回调事件方法-------

  _onLoadStart = () => {
    console.log('视频开始加载...');
  };

  _onBuffering = () => {
    console.log('视频缓冲中...');
  };

  _onLoad = (data) => {
    console.log('视频加载完成');
    this.setState({
      duration: data.duration,
    });
  };

  //进度
  _onProgressChange = (data) => {
    if (!this.state.isPaused) {
      this.setState({
        currentTime: data.currentTime,
      })
    }
  };

  //视频播放结束触发的方法
  _onPlayEnd = () => {
    console.log('播放结束');
    this.setState({
      currentTime: 0.0,
      isPaused: true,
      pause: true,
      playFromBeginning: true,
      isShowVideoCover: this.state.hasCover
    });
  };

  _onPlayError = () => {
    console.log('视频播放失败');
  };

  /// -------控件点击事件-------

  _onTapVideo = () => {
    let isShow = !this.state.isShowControl;
    this.setState({
      isShowControl: isShow,
    })
  };

  _onTapPlayButton = () => {
    let isPause = !this.state.isPaused;
    let isShowControl = false;
    if (!isPause) {
      isShowControl = true;
    }
    this.setState({
      isPaused: isPause,
      isShowControl: isShowControl,
      isShowVideoCover: false,
      pause: !this.state.isPaused
    });
    if (this.state.playFromBeginning) {
      this.videoRef.seek(0);
      this.setState({
        playFromBeginning: false,
      })
    }
  };

  _onSliderValueChange = (currentTime) => {
    this.videoRef.seek(currentTime);
    if (this.state.isPaused) {
      this.setState({
        currentTime: currentTime,
        isPaused: false,
        isShowVideoCover: false
      })
    } else {
      this.setState({
        currentTime: currentTime
      })
    }
  };

  _onTapSwitchButton = () => {
    this.props.onChangeOrientation && this.props.onChangeOrientation(this.state.isFullScreen);
  };

  _onTapBackButton = () => {
    if (this.state.isFullScreen) {
      Orientation.lockToPortrait();
    } else {
      this.props.onTapBackButton && this.props.onTapBackButton();
    }
  };

  updateVideo(videoUrl, seekTime, videoTitle) {
    this.setState({
      videoUrl: videoUrl,
      videoTitle: videoTitle,
      currentTime: seekTime,
      isPaused: false,
      isShowVideoCover: false,
    });
    this.videoRef.seek(seekTime)
  }

  updateLayout(width, height, isFullScreen) {
    this.setState({
      videoWidth: width,
      videoHeight: height,
      isFullScreen: isFullScreen
    })
  }

}

export function formatTime(second) {
  let h = 0, i = 0, s = parseInt(second);
  if (s > 60) {
    i = parseInt(s / 60);
    s = parseInt(s % 60);
  }
  // 补零
  let zero = function (v) {
    return (v >> 0) < 10 ? "0" + v : v;
  };
  return [zero(h), zero(i), zero(s)].join(":");
}

const styles = StyleSheet.create({
  playButton: {
    width: 50,
    height: 50,
  },
  bottomControl: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  timeText: {
    fontSize: 13,
    color: 'white',
    marginLeft: 5,
    marginRight: 5
  },
  videoTitle: {
    fontSize: 14,
    color: 'white'
  },
  control_play_btn: {
    width: 24,
    height: 24,
    marginLeft: 15
  },
  control_switch_btn: {
    width: 15,
    height: 15,
    marginRight: 15
  },
  backButton: {
    flexDirection:'row',
    width: 44,
    height: 44,
    alignItems:'center',
    justifyContent:'center',
    marginLeft: 10
  },
});