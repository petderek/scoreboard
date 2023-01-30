import logo from './logo.svg';
import './App.css';
import React from "react";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>testing testing</p>
          <code>hola</code>
          <ScoreBoard/>
      </header>
    </div>
  );
}


const ScoreBox = ({value, notify}) => {
    const [initial, modify] = React.useState(value)
    function update(event) {
        let num = parseInt(event.target.value)
        modify(num);
        notify(num);
    }
    return (
        <span className="ScoreBox" style={{width: "20px"}}>
            <input style={{width: "30px"}} type="number" value={initial} onChange={update}/>
        </span>
    )
};

const TitleBox = ({value, notify, readonly}) => {
    const [initial, modify] = React.useState(value)
    function update(event) {
        modify(event.target.value)
        notify(event.target.value)
    }
    return (
        <span className="TitleBox">
            <input type="text" value={initial} onChange={update}/>
        </span>
    )
}

class ScoreRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.initialTitle,
            scores: props.initialScores,
            isPrimary: false
        };
    }

    updateScore(pos) {
        return (elem) => {
            let scores = this.state.scores
            scores[pos] = elem
            this.setState({scores: scores})
        };
    }

    updateTitle(title) {
        this.setState({title: title})
    }

    render() {
        const rows = this.state.scores.map((e, i) => <ScoreBox value={e} notify={this.updateScore(i)}/>)
        return (
            <div className="ScoreRow">
                <TitleBox value={this.state.title} notify={this.updateTitle} readonly={this.state.isPrimary}/>
                {rows}
                <input style={{width: "30px"}} type="number" readOnly={true} value={this.state.scores.reduce((acc, x) => acc + x, 0)}/>
            </div>
        )
    }
}

class ScoreBoard extends React.Component {
    render() {
        return (
            <div className="ScoreBoard">
            <ScoreRow initialTitle={"primary"} initialScores={[16,0,0,0,1]}/>
            <ScoreRow initialTitle={"plant potato"} initialScores={[0,0,0,0,1]}/>
            <ScoreRow initialTitle={"grow potato"} initialScores={[16,0,4,0,1]}/>
            <ScoreRow initialTitle={"eat potato"} initialScores={[1,0,0,0,1]}/>
            <ScoreRow initialTitle={"play games on potato"} initialScores={[6,0,0,0,1]}/>
            </div>
        )
    }
}

export default App;
