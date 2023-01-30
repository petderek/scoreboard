import './App.css';
import React from "react";

function App() {
  return (
    <div className="App">
      <header className="App-header">
          <ScoreBoard
              id="player-one"
              team="loopy loopers"
              initialObjectives={["Primary", "Plant Potato", "Grow Potato", "Eat Potato", "Play Games On Potato"]}
              initialScore={[
                  [1,2,3,4,5],
                  [0,0,0,0,1],
                  [16,0,4,0,1],
                  [1,0,0,0,1],
                  [6,0,0,0,1]
              ]}
          />
          <br />
      </header>
    </div>
  );
}


const ScoreBox = ({value, notify}) => {
    const [initial, modify] = React.useState(value)
    console.log("init box")
    function update(event) {
        console.log("update box")
        let num = parseInt(event.target.value);
        modify(num);
        notify(num);
    }
    return (
        <span className="ScoreBox" style={{width: "20px"}}>
            <input style={{width: "30px"}} type="number" value={initial} onChange={update}/>
        </span>
    )
};

const TitleBox = ({value, notify}) => {
    const [initial, modify] = React.useState(value)
    function update(event) {
        let text = event.target.value;
        modify(text);
        notify(text);
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
        console.log("init row")
        this.state = {
            title: props.initialTitle,
            scores: props.initialScores,
            notify: props.notify,
        };
    }

    updateScore(pos) {
        return (elem) => {
            console.log("redraw row")
            let scores = this.state.scores;
            scores[pos] = elem;
            this.setState({scores: scores});
            this.state.notify(scores)
        };
    }

    updateTitle() {
        return (x) => this.setState({title: x});
    }

    render() {
        const rows = this.state.scores.map((e, i) => <ScoreBox key={i} value={e} notify={this.updateScore(i)}/>)
        return (
            <div className="ScoreRow">
                <TitleBox value={this.state.title} notify={this.updateTitle} />
                {rows}
                <input style={{width: "30px"}} type="number" value={this.state.scores.reduce((acc, x) => acc + x, 0)}/>
            </div>
        )
    }
}

class ScoreBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            team: this.props.team,
            score: this.props.initialScore,
            objectives: this.props.initialObjectives,
        }
    }
    updateScoreRow(pos) {
        return (elem) => {
            let score = this.state.score;
            score[pos] = elem
            this.setState({
                score: score,
            })
        }
    }

    updateName() {
        return (name) => {
            this.setState({name: name})
        }
    }
    render() {
        let rows = this.state.score.map((e, i) =>
            <ScoreRow
                key={i}
                initialTitle={this.state.objectives[i]}
                initialScores={e}
                notify={this.updateScoreRow(i)}
            />
        )
        let totalScore = this.state.score.reduce((acc, e) =>
            acc + e.reduce((acc, e) => acc + e, 0),
            10
        );
        return (
            <div className="ScoreBoard">
                <TitleBox value={this.state.team} notify={this.updateName()} />
                {rows}
                <div>Total: {totalScore}</div>
            </div>
        )
    }
}

export default App;
