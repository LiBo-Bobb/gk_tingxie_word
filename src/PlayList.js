import React, {Component} from 'react';
import './App.css';
//import Select from 'react-select';
//import 'react-select/dist/react-select.css';
import AudioPlayer from './AudioPlayer'
class PlayList extends Component {
    constructor(props) {
        super(props);
        this.audioPlayerIndexList =[]//[{Id,Player}]
        this.state = {
            autoPlayList:true,
            //当前循环播放的次数
            currentLoopTime: 0,
            //循环次数
            loopTargetTimes:3,
            //是否有播放器正在播放
            hasPlayerIsBusing:false,
            //当前播放器的索引
            currentPlayerIndex:0
        }
    }
    componentDidMount() {
    }
    //副组件调用主组件的方法，注册
    handleRegiste=(audioPlayerObj,playerId)=> {
        this.audioPlayerIndexList.push({
            Id: playerId,
            Player: audioPlayerObj
        })
        console.log("---------")
        console.dir(this.audioPlayerIndexList)
    }
    //第几个音频播放器即将播放
    handleAudioPlayWillStart =(playerId)=> {
        console.dir(`${playerId} will start play`)
        this.setState({hasPlayerIsBusing: true})
        let {model} = this.props;
        if (model == "list") {
            this.audioPlayerIndexList.forEach((itemInfo) => {
                if (itemInfo.Id != playerId) {
                    itemInfo.Player.stopPlay()
                }
            })
        }
    }
    //处理音频播放结束以后发生的事情
    handleAudioPlayEnded =(playerId,isManualStoped)=>{
        this.setState({hasPlayerIsBusing:false})
        console.dir(`${playerId} ended `+(isManualStoped?'人为停止':"自然停止"))
        if(this.state.autoPlayList && !isManualStoped){
            if(this.state.currentLoopTime < this.state.loopTargetTimes-1){
                this.setState({
                    currentLoopTime:this.state.currentLoopTime+1
                })
                this.audioPlayerIndexList[playerId].Player.startPlay()
            }else{
                this.shiftPlayer(1)
                //播放下一曲
                let nextPlayerIndex = playerId+1
                if(nextPlayerIndex<this.audioPlayerIndexList.length){
                    this.audioPlayerIndexList[nextPlayerIndex].Player.delayStartPlay(2000)
                }
                this.setState({currentLoopTime:0})
            }
        }
    }
    shiftPlayer=(directStep)=>{
        //如果当前单词正在播放，则暂停当前的，并且让下一个单词保持播放（自动播放）
        let prevAudio = this.audioPlayerIndexList[this.state.currentPlayerIndex].Player
        let prevAudioIsPlaying = prevAudio.getIsPlaying()
        prevAudio.stopPlay()

        let newIndex = this.state.currentPlayerIndex+directStep

        if(newIndex<0 || newIndex >= this.audioPlayerIndexList.length){
            return
        }
        this.setState({
            currentPlayerIndex:newIndex
        })
        let {model} = this.props
        if(model=="single") {
            this.audioPlayerIndexList.forEach((itemInfo) => {
                itemInfo.Player.hide()
            })
            this.audioPlayerIndexList[newIndex].Player.show()
        }
        //
        if(this.state.autoPlayList && prevAudioIsPlaying){
            this.audioPlayerIndexList[newIndex].Player.startPlay()
        }
    }

    render() {
        let {model} = this.props
        //console.log("modele的类型",model)
        let mp3list = [
            `./audio/grade1/011qingshui.mp3`,
            `./audio/grade1/002dongxue.mp3`,
            `./audio/grade1/003xuehua.mp3`,
            `./audio/grade1/004feiru.mp3`,
            `./audio/grade1/005shenme.mp3`,
            `./audio/grade1/006shaungshou.mp3`
        ]
        return (<div style={{backgroundColor:'#ddd',margin:'2px'}}>
            当前播放器:{this.state.currentPlayerIndex+1}
            {this.state.loopTargetTimes>1 && this.state.hasPlayerIsBusing &&
            <div>第{this.state.currentLoopTime+1}次播放</div>
            }
            {mp3list.map((mp3url,index)=>
                <AudioPlayer
                    isShow={(model=="single")?(index==0):true}
                    key={'audioplay_'+index}
                    playerId={index}
                    onRegiste={this.handleRegiste}
                    onAudioPlayWillStart={this.handleAudioPlayWillStart}
                    onAudioPlayEnded={this.handleAudioPlayEnded}
                    mp3={mp3url}> </AudioPlayer>
            )}
            <span onClick={()=>{this.shiftPlayer(-1)}}>上一个</span> |
            <span onClick={()=>{this.shiftPlayer(1)}}>下一个</span>
      </div>);
    }
}

export default PlayList;
