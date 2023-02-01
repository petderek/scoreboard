import './App.css';
import React from "react";

function App() {
  return (
    <div className="App">
      <div className="container">
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
          <ScoreBoard
              id="player-two"
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
      </div>
    </div>
  );
}


const ScoreBox = ({value, notify}) => {
    const [score, modify] = React.useState(value)
    function update(x, y) {
        let newScore = x + y
        if(newScore < 0 || isNaN(newScore)) {
            // no negatives or blank space, coerce to 0
            newScore = 0;
        }
        modify(newScore);
        notify(newScore);
    }
    return (
        <span style={{display: "inline-block", margin: "5px"}} className="ScoreBox">
            <span style={{display: "inline"}}>
                <button className="lil"  onClick={() => update(score, -1)}>-</button>
            </span>
            <input style={{width:"10px"}} type="number" value={score} readOnly={true}/>
            <span style={{display: "inline"}}>
                <button className="lil" onClick={() => update(score, 1)}>+</button>
            </span>
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
                <input readOnly={true} style={{width: "20px"}} type="number" value={this.state.scores.reduce(sumFn)}/>
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
        // sum of sums, +10
        let totalScore = this.state.score.reduce((acc, e) =>
            acc + e.reduce(sumFn),
            10
        );
        return (
            <div className="ScoreBoard">
                Team: <TitleBox value={this.state.team} notify={this.updateName()} />
                {rows}
                <div>Total: {totalScore}</div>
            </div>
        )
    }
}

function sumFn(runningTotal, val) {
    return runningTotal + val
}

export default App;
