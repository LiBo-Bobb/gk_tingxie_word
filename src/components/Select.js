import React, { Component, PropTypes } from 'react';
export class Select extends Component {
    constructor(props){
        super(props)
    }
    //定义属性并且验证
    static propTypes = {
        options:PropTypes.array.isRequired,
        value:PropTypes.object.isRequired,
        onChange:PropTypes.func
    }

    render() {
        let styles={border:'0 soild #000',appearance:'none'}
        let {value,options,onChange=null,disabled=false} = this.props
        if(!disabled){
        return (
            <select style={{...styles}}
                defaultValue={value.value}
                onChange={e=>{
                let indx = e.target.selectedIndex
                let {value,text:label} = e.target.options[indx]
                onChange && onChange({value,label})
            }}>
                {options.map((option,index)=>{
                    return <option key={index} value={option.value}
                    >{option.label}</option>
                })}

            </select>)
        }else {
            return <span style={{...styles,fontSize:'14px',color:'#999'}}>{options[value.value-1].label}</span>
        }
    }

}