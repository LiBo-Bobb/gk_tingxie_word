import React, {PropTypes, Component} from 'react';
import {Select} from './Select';
import '../App.css';
export class Word extends Component {
    static propTypes = {
        showWord: PropTypes.bool
    }
    state = {
        content: '循环播放'
    }

    render() {
        //let { style } = this.props;
        let innerStyle = {
            width: '340px',
            // height: '600px',
            border: '1px solid gray',
            margin: '10px auto',
            // borderRadius: '5px',
        };
        let wordStyle = {
            width: '70px',
            height: '30px',
            border: '1px solid gray',
            float: 'left',
            margin: '10px 20px auto',
            lineHeight: '30px',
            textAlign: 'center'
        };
        let lineStyle = {
            margin: '80px auto',
            width: '340px'
        };
        let buttonStyle = {
            width: '120px',
            height: '36px',
            border: '1px solid gray',
            fontSize: '16px',
            margin: '30px auto',
            color: 'gray',
            lineHeight: '36px',
            textAlign: 'center',
            borderRadius: '6px'


        };
        let buttonBox = {
            width: '340px',
            border: '0px solid gray',
            display: 'flex',
            flexWrap: 'nowrap'
        };
        let topT = {
            width: '160px',
            height: '20px',
            border: '1px solid red'
        };
        let togButton = {
            width: '60px',
            height: '20px',
            border: '1px solid red'
        };

        return (
            <div>

                <div style={{
                    display: this.props.showWord ? 'block' : 'none',
                    position: "fixed",
                    top: 0,
                    left: 16,
                    margin: '-4px auto',
                    height: "100vh",
                    width: "100%",
                    background: "#fff",
                    zIndex: 10,
                    ...innerStyle
                }}>
                    <div style={{...topT}}>03 春天里的小松鼠</div>
                    <div style={{...togButton}} onClick={this.props.onClick}>切换</div>
                    <div style={{...wordStyle}}>春天</div>
                    <div style={{...wordStyle}}>力量</div>
                    <div style={{...wordStyle}}>视频</div>
                    <div style={{...wordStyle}}>免费</div>
                    <div style={{...wordStyle}}>名称</div>
                    <div style={{...wordStyle}}>课程</div>
                    <div style={{...wordStyle}}>听写</div>
                    <div style={{...wordStyle}}>联系</div>
                    <div style={{...wordStyle}}>松鼠</div>
                    <div style={{...wordStyle}}>老虎</div>
                    <div style={{...wordStyle}}>小鸟</div>
                    <div style={{...wordStyle}}>大雁</div>
                    <div style={{...wordStyle}}>学习</div>
                    <div style={{...wordStyle}}>舞蹈</div>
                    <div style={{...wordStyle}}>唱歌</div>
                    <div style={{...wordStyle}}>音乐</div>
                    <div style={{...wordStyle}}>画画</div>
                    <div style={{...wordStyle}}>夏天</div>
                    <div style={{...wordStyle}}>大雨</div>
                    <div style={{...wordStyle}}>英语</div>
                    <div style={{...wordStyle}}>舞蹈</div>
                    <div style={{...wordStyle}}>唱歌</div>
                    <div style={{...wordStyle}}>音乐</div>
                    <div style={{...wordStyle}}>画画</div>
                    <div style={{...wordStyle}}>夏天</div>
                    <div style={{...wordStyle}}>大雨</div>
                    <div style={{...wordStyle}}>英语</div>
                    <hr style={{...lineStyle}}/>
                    <div className="box">
                        <div className="box1">
                            <Select optValue={this.state.content}/>
                        </div>
                        <div className="box1">
                            <Select optValue={this.state.content}/>
                        </div>
                        <div className="box1">
                            <Select optValue={this.state.content}/>
                        </div>
                    </div>
                    <div style={{...buttonBox}}>
                        <div style={{...buttonStyle}}>暂停自动听读</div>
                        <div style={{...buttonStyle}}>显示答案</div>
                    </div>
                </div>
            </div>
        )
    }
}