import React, { PropTypes, Component } from 'react';
export class TestList extends Component {
    //定义属性
    static propTypes = {
        handleClick: PropTypes.func,
        data: PropTypes.array
    }
    constructor(...ma) {
        super(...ma);
        this.state = {
            lists: this.props.data
        }
    }
    render() {
        let { lists } = this.state;
        return (
            <ul>
                {
                    lists.map((listItem, index) => {
                        return <li key={index} onClick={e=>{
                            this.props.handleClick&&this.props.handleClick(index,listItem.name);
                            }} >
                           {listItem.name}
                        </li>

                    })
                }
            </ul>
        )
    }
}

