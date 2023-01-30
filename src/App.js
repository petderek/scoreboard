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
          <ScoreRow initialTitle={"primary"} initialScores={[16,0,0,0,1]}/>
      </header>
        <code>ok</code>
    </div>
  );
}

const Beuton = ({x}) => {
    const [initial, modify] = React.useState(x)
    function update(event) {
        modify(event.target.value);
    }
    return (
        <span className="Beuton">
            <input type="number" value={initial} onChange={update}/>
        </span>
    )
};

class ScoreRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.initialTitle,
            scores: Array(5).fill(0)
        };
        if(Array.isArray(props.initialScores) && props.initialScores.length === 5) {
          this.state.scores = props.initialScores;
        }
    }
    render() {
        const rows = this.state.scores.map((e, i) => <Beuton x={e}/>)
        return (
            <div className="ScoreRow">
                <input type="text" value={this.state.title}/>
                {rows}
                <input type="number" value={this.state.scores.reduce((acc, x) => acc + x, 0)}/>
            </div>
        )
    }
}

export default App;
