import React, {Component} from "react";
import "./index.css";
import "./App.css";
import {TimeCounter} from "./components/TimeCounter";
import {Select} from "./components/Select";
import ScratchCard from "./components/ScratchCard";
import scratchImage from "./images/scratchimage.png";
import "weui";
import 'react-weui/build/packages/react-weui.css';
import {ActionSheet} from 'react-weui'
import start from "./images/start.png";
import pause from "./images/pause.png";
import catlog from "./images/catlog.png";
const wepink = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEElEQVR4AWP4X8AgBcJwBgA9lAYloqVirwAAAABJRU5ErkJggg==";
class App extends Component {
    constructor(props) {
        super(props);
        //console.log(props)
        let {courseName, sectionName, data} = props.data;
        this.courseName = courseName;
        this.sectionName = sectionName;
        this.firstChangeMode = true;
        //时间间隔初始设置
        this.intervalOptions = [
            {value: 1, label: '间隔2秒'},
            {value: 2, label: '间隔4秒'},
            {value: 3, label: '间隔6秒'}
        ];
        //循环次数初始设置
        this.loopOptions = [
            {value: 1, label: '只读一次'},
            {value: 2, label: '循环两次'},
            {value: 3, label: '循环三次'}
        ];
        //是否选择随机播放
        this.randomOptions = [
            {value: 1, label: '顺序播放'},
            {value: 2, label: '随机播放'},
        ];
        this.timeOut = 0;
        this.state = {
            cardWrapHeight: 'auto',
            showAnswer: true,
            data: data,
            //时间变化
            playPrec: 0,
            //所有单词听写完成以后，Dialg
            allPlayDone: false,
            //随机播放的单词资源
            randomAudios: [],
            //当前单词的索引
            currentAudio: 0,
            //秒数
            count: '',
            //单词卡片翻页控制
            showCard: true,
            isShowTimeRestart: true,
            //显示提示框！！！
            isShowDialg: false,
            isShowDialgs: false,
            //列表模式下。读完单词提示
            isShowDialgss: false,
            //显示汉字
            showHanzi: false,
            //如果播放结束则返回true，否则返回false
            ended: true,
            //间隔时间
            intervalSelect: {value: 1, label: '间隔2秒'},
            //循环播放
            loopSelect: {value: 1, label: '只读一次'},
            //已经循环多少次
            looped: 0,
            //顺序播放和随机播放
            randomSelect: {value: 1, label: '顺序播放'},
            //结束循环
            endLoop: false,
            //默认状态为手动播放
            autoPlay: false,
            ios_show: false,
            menus: [{
                label: 'Option 1',
                onClick: ()=> {}
            }, {
                label: 'Option 2',
                onClick: ()=> {}
            }],
            actions: [
                {
                    label: 'Cancel',
                    onClick: this.hide.bind(this)
                }
            ]

        };

    }
    hide(){
        this.setState({
            ios_show: false,
        });
    }

    componentDidMount() {
    }

    //首个单词播放完成以后处理，包括顺序和乱序的判断
    handleAudioPlayDone = () => {
        //console.log(this)
        //console.log('结束播放...')
        //每次读完以后ended:true
        this.setState({ended: true});
        //定义一个定时器对象
        this.interval_updatePlayTime = null;
        //清除计时器
        clearInterval(this.interval_updatePlayTime);
        let {looped, currentAudio, data, randomAudios} = this.state;
        let wordsData = data;
        if (this.state.randomSelect.value == 1) {//顺序播放
            wordsData[currentAudio].played = true
        } else {//对于数组中的每个元素，findIndex 方法都会调用一次回调函数（采用升序索引顺序），直到有元素返回 true。只要有一个元素返回 true，findIndex 立即返回该返回 true 的元素的索引值。如果数组中没有任何元素返回 true，则 findIndex 返回 -1。
            let index = data.findIndex(dataItem => randomAudios[currentAudio].hanzi == dataItem.hanzi);
            wordsData[index].played = true
        }
        //data中的每个对象都加入了played属性
        this.setState({data: wordsData});
        //已经读过的个数
        let arr = [];
        data.forEach((item, index) => {
            if (item.played) {
                return arr.push(item.id)
            }
        });
        if (this.state.autoPlay) {//自动播放
            //循环次数(+可以将数据转化为number类型)
            let loopLength = +this.state.loopSelect.value;
            //循环结以后
            looped === 0 && this.checkLoop();
            //每次循环一次，looped+1
            looped += 1;
            // console.log("分别是循环长度和已经循环的次数");
            // console.log(loopLength, looped);
            //循环结束
            if (loopLength === looped) {
                //循环结束以后，刷新答案涂层
                this.refs.scratchCard.init();
                //console.log('循环结束')
                if (currentAudio >= data.length - 1) {
                    currentAudio = data.length - 1
                    if (!this.state.showCard) {//单词列表页面
                        this.setState({ended: true, autoPlay: false, isShowDialgss: true})
                    } else {
                        let duration = this.refs.audio.duration * 1000;
                        setTimeout(() => {
                            this.setState({
                                ended: true, autoPlay: false, allPlayDone: true
                            })
                        }, duration);

                    }
                } else {
                    currentAudio += 1;
                }
                setTimeout(() => {
                    this.setState({ended: true, looped: 0, currentAudio});
                    this.handleAudioPlayStart()
                }, this.state.intervalSelect.value * 2000)

            } else {
                this.setState({ended: true, looped})
            }
        } else {
            this.setState({ended: true})
        }
    };
    //音频播放开始的事情 计算进度条的变化
    handleAudioPlayStart = () => {
        //console.log('handleAudioPlayStart');
        if (this.interval_updatePlayTime) {
            clearInterval(this.interval_updatePlayTime)
        }
        this.interval_updatePlayTime = setInterval(() => {
            //音频进度百分比
            try {
                let playPrec = (this.refs.audio.currentTime * 1.0 / this.refs.audio.duration);
                if (this.state.playPrec != playPrec.toFixed(1)) {
                    this.setState({playPrec: playPrec.toFixed(1)})
                }
            } catch (err) {

            }
        }, 50)
        this.setState({ended: false})
    };

    //下拉框选中时间间隔几秒，更新状态
    intervalChange = ({value, label}) => {
        //console.log("Selected: ", {value, label});
        this.setState({
            intervalSelect: {value, label}
        })
    };
    //下拉框选中循环播放几次，更新当前的数据setState()
    loopChange = ({value, label}) => {
        //console.log("Selected: ", {value, label});
        this.setState({
            loopSelect: {value, label}
        })
    };
    //顺序播放和循环播放
    randomChange = ({value, label}) => {
        this.refs.scratchCard.init();
        //console.log("Selected: ", {value, label});
        //从索引为0 开始传参数  randomAudios为已经打乱顺序的对象
        if (this.state.randomAudios.length === 0) {
            let randomAudios = this.shuffle(this.state.data.slice(0))
            //console.log(randomAudios)
            this.setState({
                randomSelect: {value, label},
                randomAudios
            })
        } else {
            this.setState({
                randomSelect: {value, label}
            })
        }


    };
    //打乱数组
    shuffle = (array) => {
        let currentIndex = array.length
            , temporaryValue
            , randomIndex
        ;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    };
    //判断间隔几秒和循环次数
    checkLoop = () => {
        //单词播放的时间
        let duration = this.refs.audio.duration * 1000;
        //console.log(Math.floor(duration));
        if (+this.state.loopSelect.value >= 2) {
            setTimeout(() => {
                this.refs.audio.play();
                this.handleAudioPlayStart();
                if (+this.state.loopSelect.value === 3) {
                    setTimeout(() => {
                        this.refs.audio.play()
                        //单词开始播放的时候，更新播放的时间
                        this.handleAudioPlayStart()
                    }, this.state.intervalSelect.value * 2000 + duration)
                }
            }, this.state.intervalSelect.value * 2000 + duration)
        }
    };
    //点击播放器圆形播放按钮
    handleClickPlayBtn = () => {
        if (this.state.ended) {
            let played = this.state.data[this.state.currentAudio].played;
            this.checkLoop();
            //只有played为false的时候点击才能重新计时
            if (!played && this.refs.ReTimeCounter) {
                this.refs.ReTimeCounter.restart();
            }
            //正面总时间计时
            this.refs.timeCounter.start();
            //背面总时间计时
            this.refs.timeCounters.start();
            this.refs.audio.play();
            this.handleAudioPlayStart();
            //console.log(this.refs.audio.ended)
        } else {//音频没有播放完的情况下
            this.refs.audio.pause();
            this.setState({ended: true});
        }
    };
    handleClickPlayBtns = () => {
        let played = this.state.data[this.state.currentAudio].played;
        this.checkLoop();
        //只有played为false的时候点击才能重新计时
        if (!played && this.refs.ReTimeCounter) {
            this.refs.ReTimeCounter.restart();
        }
        //正面总时间计时
        this.refs.timeCounter.start();
        //背面总时间计时
        this.refs.timeCounters.start();
        this.refs.audio.play();
        this.handleAudioPlayStart();
        //console.log(this.refs.audio.ended)

    };

    handleNextClick = () => {//点击下一个
        let {data} = this.state;
        //刷新涂层
        this.refs.timeCounter.start();
        this.refs.scratchCard.init();
        this.checkLoop();
        if (this.state.isShowTimeRestart) {//点击下一个，重新计时（当前单词所用的时间）
            this.refs.ReTimeCounter.restart();
        }
        let currentAudio = this.state.currentAudio + 1;
        if (currentAudio >= data.length) {
            this.setState({ended: true, allPlayDone: true})
        } else {
            this.setState({currentAudio, ended: false});
            //此方法舒心进度条
            this.handleAudioPlayStart();
        }
    };
    //正则检测汉字是否要标记为红色
    handleHanzi = (hanzi) => {
        return <span
            dangerouslySetInnerHTML={{__html: hanzi.replace(/\[([^\]]+)\]/g, '<span style="color:red;">$1</span>')}}></span>
    }

    handlePrevClick = () => {//点击上一个
        this.refs.scratchCard.init();
        this.checkLoop();
        this.refs.timeCounter.start()
        this.refs.ReTimeCounter.restart();
        let currentAudio = this.state.currentAudio - 1;
        if (currentAudio < 1) {
            this.setState({currentAudio: 0, ended: true});
        } else {
            this.handleAudioPlayStart()
            this.setState({currentAudio, ended: false});
        }

    };

    //再听一遍
    agninLisen = () => {
        // location.reload(true)
        window.InitPlayer();
        this.setState({allPlayDone: false, ended: true})
    };
    //自动播放结束以后，确认结束
    sureEnd = () => {
        this.setState({allPlayDone: false});
        let {GKListenWords} = window;
        window.location.href = GKListenWords.dirUrl
    };
    //切换自动播放
    shiftAutoPlay = () => {
        try {
            let new_autoPlay = !this.state.autoPlay;
            this.setState({
                autoPlay: new_autoPlay,
                isShowTimeRestart: !this.state.isShowTimeRestart,
                ended: true
            });
            //最新状态处于自动播放
            if (new_autoPlay) {
                if (this.state.ended) {
                    //当前不在播放时，自动播放第一个
                    this.setState({
                        currentAudio: 0
                    });
                    setTimeout(() => {

                        this.handleClickPlayBtns()
                    }, 30)
                } else {
                    //console.log("1111")
                    //nothing to do:有音频正在播放，则不做响应，等该音频完毕时，会自动检测到自动播放机制
                }
            }
        } catch (err) {
            console.log(err)
        }

    };
    // 目录按钮点击事件
    handleClickCatalog = e => {
        let {GKListenWords} = window;
        window.location.href = GKListenWords.dirUrl;
    }
    changMode = () => {
        if (this.firstChangeMode) {
            this.firstChangeMode = false;
            setTimeout(() => {
                let {cardWrap, showAnswer} = this.refs;
                let cardWrapHeight = showAnswer.offsetTop - cardWrap.offsetTop + 'px';
                this.setState({cardWrapHeight});
            }, 0);
        }
        let {showCard} = this.state;
        this.setState({showCard: !showCard});
    }

    render() {
        // onClick={this.shiftAutoPlay}
        //所有的数据
        let prec = {
            background: `url(${wepink})`,
            backgroundPositionX: `${ ((window.innerWidth + 90) / 3) * (this.state.playPrec / 1.0 - 1)}px`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%'
        }
        let {data, randomAudios, autoPlay, intervalSelect, showCard, cardWrapHeight} = this.state;
        // let english = /^[a-zA-Z\.\s]+$/;
        let english =/^[a-zA-Z\.\s-]+$/;

        // this.refs.shiftAutoPlays.addEventListener("touchstart",this.shiftAutoPlay);
        return (
            <div className="App">
                <ActionSheet
                    menus={this.state.menus}
                    actions={this.state.actions}
                    type="ios"
                    show={this.state.ios_show}
                    onRequestClose={e => this.setState({ios_show: false})}
                />


                <div className="weui-mask" style={{display: this.state.isShowDialgss ? "block" : "none"}}>
                </div>
                <div className="weui-dialog" style={{display: this.state.isShowDialgss ? "block" : "none"}}>
                    <div className="weui-dialog__bd">你已经听完所有单词，可以查看答案了！</div>
                    <div className="weui-dialog__ft">
                        <a href="javascript:;" style={{color: "#109a11"}} onClick={
                            () => {
                                {/*window.InitPlayer();*/
                                }
                                setTimeout(() => {
                                    this.setState({isShowDialgss: false, ended: true})
                                }, 2000)
                            }
                        } className="weui-dialog__btn weui-dialog__btn_primary">知道了</a>
                    </div>
                </div>
                {/*单词模式下，全部听完提示*/}
                <div className="weui-mask" style={{display: this.state.allPlayDone ? "block" : "none"}}>
                </div>
                <div className="weui-dialog" style={{display: this.state.allPlayDone ? "block" : "none"}}>
                    <div className="weui-dialog__hd"><strong className="weui-dialog__title">温馨提示！</strong></div>
                    <div className="weui-dialog__bd">已经是最后一个了，确定结束吗？</div>
                    <div className="weui-dialog__ft">
                        <a href="javascript:;"
                           className="weui-dialog__btn weui-dialog__btn_default"
                           onClick={this.agninLisen}>重新听写</a>
                        <a href="javascript:;" onClick={this.sureEnd}
                           className="weui-dialog__btn weui-dialog__btn_primary">确定结束</a></div>
                </div>
                {/*连续播放过程中，点击每一个单词，提示框*/}
                <div className="weui-mask" style={{display: this.state.isShowDialg ? "block" : "none"}}>
                </div>
                <div className="weui-dialog" style={{display: this.state.isShowDialg ? "block" : "none"}}>
                    <div className="weui-dialog__hd"><strong className="weui-dialog__title">温馨提示！</strong></div>
                    <div className="weui-dialog__bd">是否停止连续播放？</div>
                    <div className="weui-dialog__ft"><a href="javascript:;"
                                                        className="weui-dialog__btn weui-dialog__btn_default"
                                                        onClick={() => {
                                                            this.refs.audio.play();
                                                            this.setState({isShowDialg: false})
                                                        }}>否</a><a
                        href="javascript:;" onClick={() => {
                        this.setState({isShowDialg: false, autoPlay: false})
                    }} className="weui-dialog__btn weui-dialog__btn_primary">是</a></div>
                </div>
                {/*单词没有读完，但是点击【显示中文】按钮的时候提示框*/}
                <div className="weui-mask" style={{display: this.state.isShowDialgs ? "block" : "none"}}>
                </div>
                <div className="weui-dialog" style={{display: this.state.isShowDialgs ? "block" : "none"}}>
                    <div className="weui-dialog__bd">请先听完所有单词，再查看答案！</div>
                    <div className="weui-dialog__ft">
                        <a href="javascript:;" style={{color: "#109a11"}} onClick={() => {
                            this.setState({isShowDialgs: false})
                        }} className="weui-dialog__btn weui-dialog__btn_primary">知道了</a>
                    </div>
                </div>

                {/*音频播放*/}
                <div className="panel_front" style={{display: showCard ? "block" : "none"}}>

                    <div className="App-audio">
                        <div className="topTitle">
                            <div className="catalogPng"><img src={catlog}/></div>
                            <div className="catalog" onClick={this.handleClickCatalog}>目录
                            </div>
                            <div className="icon white">总</div>
                            {/*顶部学习总时间*/}
                            <div className="totaltime white">
                                <TimeCounter ref="timeCounter" style={{color: 'white'}} showMinute={true}
                                             onStep={({count, time}) => {
                                                 this.setState({count})
                                             }}/>
                            </div>
                            {/*切换单词卡片按钮*/}
                            <div className="shiftCard white" onClick={this.changMode}>列表模式
                            </div>
                        </div>
                        {/*<div onClick={()=>{this.setState({ios_show:true})}}>test</div>*/}
                        <div style={{color: 'white', fontSize: '12px'}}>{this.courseName}</div>
                        <div style={{color: 'white', fontSize: '18px', margin: '5px auto'}}>{this.sectionName}
                        </div>
                        {/*上下切换按钮*/}
                        <div className='qiehuan'>
                            <div className="weui-flex" style={{width: '100%', margin: 'auto'}}>
                                <div className="weui-flex__item" onClick={this.state.autoPlay ? () => {
                                    this.setState({isShowDialg: true})
                                } : this.handlePrevClick}>
                                    <div className="placeholder">
                                        <div className="pre"></div>
                                    </div>
                                </div>
                                <div className="weui-flex__item">
                                    <div className="placeholder">
                                        <div className='play'
                                             onClick={this.state.autoPlay ? () => {
                                                 this.setState({isShowDialg: true})
                                             } : this.handleClickPlayBtn}>{this.state.ended ?
                                            <img src={start}/> : <img src={pause}/>}</div>
                                    </div>
                                </div>
                                <div className="weui-flex__item" onClick={this.state.autoPlay ? () => {
                                    this.setState({isShowDialg: true})
                                } : this.handleNextClick}>
                                    <div className="placeholder">
                                        <div className="next"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*显示单词当前第几个？*/}
                        <div className='bott'>
                            <div className='shunxu white'
                                 style={{color: 'white'}}> {this.state.currentAudio + 1}/{data.length}
                            </div>
                            <div className='time' style={{
                                display: this.state.isShowTimeRestart ? "block" : "none",
                                color: "white",
                                fontSize: "12px"
                            }}>
                                此单词用时：{!this.state.autoPlay &&
                            <TimeCounter showMinute={true} style={{color: 'white', fontSize: '12px'}}
                                         ref="ReTimeCounter"/>}
                            </div>
                        </div>
                        {/*音频播放器默认处于隐藏状态*/}
                        <div style={{display: 'none'}}>
                            <audio controls="controls"
                                   src={this.state.randomSelect.value == 1 ? `${data[this.state.currentAudio].audio}` : `${randomAudios[this.state.currentAudio].audio}`}
                                   ref="audio" autoPlay={this.state.currentAudio !== 0}
                                   onEnded={this.handleAudioPlayDone}>
                            </audio>
                        </div>
                    </div>

                    <div className="panel_scratchCard">
                        <ScratchCard ref="scratchCard" width='100%' height="100%" image={scratchImage}
                                     finishPercent={45}>
                            <div>
                                <div
                                    style={{fontSize: english.test(data[this.state.currentAudio].pinyin) ? "5vw" : "7vw",marginBottom:"25px"}}>
                                    {this.state.randomSelect.value == 1 ? data[this.state.currentAudio].pinyin : randomAudios[this.state.currentAudio].pinyin}
                                </div>
                                <div className="font_chinese"
                                     style={{fontSize: english.test(data[this.state.currentAudio].pinyin) ? "6vw" : "12vw"}}>

                                    {this.state.randomSelect.value == 1 ? this.handleHanzi(data[this.state.currentAudio].hanzi) :
                                        this.handleHanzi(randomAudios[this.state.currentAudio].hanzi)}</div>
                            </div>
                        </ScratchCard>
                    </div>
                </div>
                {/*style={{fontSize:reg.test(data[this.state.currentAudio].pinyin)?"1vw":"15vw"}}*/}
                <div className="cardBehind" style={{display: this.state.showCard ? "none" : "block"}}>
                    <div className="topTitle">
                        <div className="icon white">总</div>
                        {/*顶部学习总时间*/}
                        <div className="totaltime white">
                            <TimeCounter ref="timeCounters" showMinute={true} onStep={({count, time}) => {
                                this.setState({count})
                            }}/>
                        </div>
                        {/*切换单词卡片按钮*/}
                        <div className="shiftCard white" style={{color: "gray", border: "1px solid #d4cfcf"}}
                             onClick={() => {
                                 this.setState({showCard: !showCard})
                             }}>单词模式
                        </div>
                    </div>
                    <div style={{fontSize: '12px', textAlign: 'left', padding: '2px 15px'}}>{this.sectionName}</div>
                    {/*单词卡片*/}
                    <div ref="cardWrap" className="cardWrp" style={{height: cardWrapHeight}}>
                        <div className="wordlist">
                            {this.state.randomSelect.value == 1 && data.map((pinyinItem, index) => {
                                let {currentAudio} = this.state;
                                return <div className="wordItem"
                                            style={{width: english.test(data[this.state.currentAudio].pinyin) ? "100%" : "50%"}}
                                            key={'sch_' + index}>
                                    <div className="cardItem" style={{
                                        borderColor: (currentAudio == index) ? "#FF7000" : "#ECECEC",
                                        backgroundColor: pinyinItem.played ? "#F7F7F7" : "white",
                                        ...((!pinyinItem.played && currentAudio == index) ? prec : {})
                                    }}
                                         onClick={this.state.autoPlay ? () => {
                                             this.refs.audio.pause();
                                             this.setState({isShowDialg: true})
                                         } : () => {
                                             if (this.state.currentAudio == 0) {
                                                 this.refs.audio.play();
                                                 this.handleAudioPlayStart()
                                             }

                                             this.handleAudioPlayStart();
                                             this.refs.scratchCard.init();
                                             this.checkLoop();
                                             this.refs.timeCounters.start();
                                             this.refs.timeCounter.start();
                                             //console.log(index)
                                             this.setState({currentAudio: index, ended: false});
                                         }}
                                         key={index}>
                                        {this.state.showHanzi ?
                                            this.handleHanzi(pinyinItem.hanzi)
                                            : pinyinItem.pinyin}

                                    </div>
                                </div>

                            })}
                            {this.state.randomSelect.value == 2 && data.map((pinyinItem, index) => {
                                let {currentAudio} = this.state;
                                let randomIndex = randomAudios.findIndex(item => item.hanzi == pinyinItem.hanzi)
                                return <div className="wordItem"
                                            style={{width: english.test(data[this.state.currentAudio].pinyin) ? "100%" : "50%"}}>
                                    <div className="cardItem" style={{
                                        borderColor: (currentAudio == randomIndex) ? "#FF7000" : "#ECECEC",
                                        backgroundColor: pinyinItem.played ? "#F7F7F7" : "white",
                                        ...((!pinyinItem.played && currentAudio == randomIndex) ? prec : {})
                                    }}
                                         onClick={this.state.autoPlay ? () => {
                                             this.refs.audio.pause();
                                             this.setState({isShowDialg: true})
                                         } : () => {
                                             if (this.state.currentAudio == 0) {
                                                 this.refs.audio.play();
                                                 this.handleAudioPlayStart();
                                             }
                                             this.refs.scratchCard.init();
                                             this.checkLoop();
                                             this.refs.timeCounters.start();
                                             this.refs.timeCounter.start();
                                             //console.log(randomIndex)
                                             this.setState({currentAudio: randomIndex, ended: false});
                                         }}
                                         key={index}>
                                        {this.state.showHanzi ? this.handleHanzi(pinyinItem.hanzi) : pinyinItem.pinyin}
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                    <div className="showA" ref="showAnswer">
                        <div className="cardBtnRight" onClick={
                            () => {
                                let arr = []
                                let ret = data.forEach((item, index) => {
                                    if (item.played) {
                                        return arr.push(item.id)
                                    }
                                })
                                if (arr.length === data.length) {
                                    this.setState({showHanzi: !this.state.showHanzi})
                                } else {
                                    this.setState({isShowDialgs: true})
                                }
                            }
                        }>{this.state.showHanzi ? "显示拼音" : "查看答案"}</div>
                    </div>
                </div>
                {/*单词卡片*/}

                <div className="WrpBott">
                    {/*选择框盒子*/}
                    <div className="weui-flex" style={{height: '44px', lineHeight: '44px'}}>
                        <div className="weui-flex__item">
                            <div className="placeholder">
                                <Select
                                    value={this.state.intervalSelect}
                                    options={this.intervalOptions}
                                    onChange={this.intervalChange}
                                />
                            </div>
                        </div>
                        <div className="weui-flex__item">
                            <div className="placeholder">
                                <Select
                                    value={this.state.loopSelect}
                                    options={this.loopOptions}
                                    onChange={this.loopChange}
                                />
                            </div>
                        </div>
                        <div className="weui-flex__item">
                            <div className="placeholder">
                                <Select
                                    disabled={this.state.autoPlay}
                                    value={this.state.randomSelect}
                                    options={this.randomOptions}
                                    onChange={
                                        this.randomChange
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="weui-flex">
                        <div className="weui-flex__item">
                            <div className="App-button" ref="shiftAutoPlays" style={{
                                borderColor: this.state.autoPlay ? "rgb(255, 112, 0)" : "#A0A0A0",
                                color: this.state.autoPlay ? "rgb(255, 112, 0)" : "#A0A0A0"
                            }} onClick={this.shiftAutoPlay}>
                                {this.state.autoPlay ? "取消自动听读......" : "自动听读"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default App;
