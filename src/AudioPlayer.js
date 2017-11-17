import React, {Component} from 'react';
import './App.css';
class AudioPlayer extends Component {
    constructor(props) {
        super(props);
        let {isShow} = props
        //定时器？
        this.interaler_updateTime = null
        //延迟开始的计时器
        this.interaler_delayStart = null
        this.state = {
            //默认进度条宽度]
            playPrec: 0,
            delayPlayLeftTime: 0,
            isShow,
            //是否正在播放d
            isPlaying:false
        }
        //手动停止bool
        this.isManualStoped = false
    }
    componentDidMount() {
        //注册 父组件调用自组件的方法
        let {onRegiste,playerId} = this.props
        if(onRegiste)
            onRegiste(this,playerId)
    }
    show=()=>{
        this.setState({
            isShow:true
        })
    }
    hide=()=>{
        this.setState({
            isShow:false
        })
    }
    //音频播放结束
    handleAudioPlayEnded =()=>{
        this.mp3()
        let {onAudioPlayEnded,playerId} = this.props;
        if(onAudioPlayEnded){
            onAudioPlayEnded(playerId,this.isManualStoped)
        }
    }
    //???
    mp3 = ()=>{
        clearInterval(this.interaler_updateTime)
        this.setState({
            isPlaying:false
        })
        //音频当前播放的时间
        this.refs.audio.currentTime = 0
        this.refs.audio.pause()
        //???
        this.interaler_updateTime = null
        this.updatePlayTime()
        //延迟播放剩余时间
        this.setState({delayPlayLeftTime: 0})
    }
    //开始播放音频
    startPlay=()=>{
        //是否手动停止
        this.isManualStoped = false;
        let {onAudioPlayWillStart,playerId} = this.props;
        //音频将要播放
        if(onAudioPlayWillStart)
            onAudioPlayWillStart(playerId)
        this.setState({
            isPlaying:true
        })
        this.refs.audio.play()
        //新的计时器
        this.interaler_updateTime = setInterval(this.updatePlayTime, 30)
    }
    //延迟开始播放
    delayStartPlay=(delayDuraton)=> {
        this.setState({
            delayPlayLeftTime: Math.max(delayDuraton, 100)
        })
        //??
        this.interaler_delayStart = setInterval(() => {
            if (this.state.delayPlayLeftTime <= 0) {
                //倒计时结束
                clearInterval(this.interaler_delayStart)
                this.setState({delayPlayLeftTime: 0})
                this.startPlay()
            } else {
                //没有到达终点，继续倒计时
                this.setState({
                    delayPlayLeftTime: this.state.delayPlayLeftTime - 100
                })
            }
        }, 100)
    }

    //停止播放
    stopPlay=()=>{
        console.dir(this.refs.audio)
        //停止可能的倒计时延时播放任务
        clearInterval(this.interaler_delayStart)
        //重置人为暂停的标记值
        this.isManualStoped = true
        this.mp3()
    }
    //更新播放时间
    updatePlayTime=()=>{
        //音频进度百分比
        let playPrec = (this.refs.audio.currentTime*1.0/this.refs.audio.duration)
        this.setState({playPrec})
    }

    getIsPlaying =()=>{
        return this.state.isPlaying
    }

    render() {
        let {mp3,playerId} = this.props
        //延迟播放剩余时间，用来做倒计时使用
        let {isShow=false,delayPlayLeftTime} = this.state;
        return (<div style={{border:'1px solid gray',padding:'5px',display:isShow?'block':'none'}}>
            <span>No.{playerId+1}</span> -
            <audio
                style={{display:"none"}}
                controls="controls"
                src={require(mp3)}
                ref="audio"
                onEnded={this.handleAudioPlayEnded}
            >
            </audio>
            {this.state.isPlaying &&
                <span onClick={this.stopPlay}>点击停止</span>
            }
            {!this.state.isPlaying &&
                <span onClick={this.startPlay}>点击播放</span>
            }
            ---
            <span>{this.state.playPrec.toFixed(1)}</span>
            {delayPlayLeftTime!=0 &&
                <div>
                    <span>马上开始...{this.state.delayPlayLeftTime/1000}</span>
                    <span onClick={this.stopPlay}>取消开始(停止)</span>
                </div>
            }

            <div style={{width:`${100*this.state.playPrec}px`,height:'10px',backgroundColor:'green'}}> </div>
        </div>);
    }
}

export default AudioPlayer;
