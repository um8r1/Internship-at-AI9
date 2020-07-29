import React, { useState } from 'react';
import Highlighter from "react-highlight-words";
import './App.css';

// function mark(text, highlight) {
//   const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
//   return <span> {parts.map((part, i) =>
//     <span key={i} style={part.toLowerCase() === highlight.toLowerCase() ? { fontWeight: 'bold', color: 'black', backgroundColor: 'lightblue' } : {}}>
//       {part}
//     </span>)
//   } </span>;
// }
let esurl = 'http://localhost:9200';

function Analyze(text, sethighlighttext) {
  let data = {
    "tokenizer": "icu_tokenizer",
    "text": text
  }
  fetch(esurl+"/_analyze", {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data.tokens);
      let arraydata = data.tokens.map(r => r.token)
      sethighlighttext(arraydata)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function Search(text, setdoc) {
  let data = {
    //จะให้คืนค่ามาเท่าไหร่
    "size": 10,
    "query": {
      "multi_match": {
        "query": text,
        "type": "phrase_prefix",
        "fields": [
          //ให้ค้นหาใน field ไหนบ้าง
          "title",
          "message",
          "author.name"
        ]
      }
    }
  }
  fetch(esurl+"/pantip/_search", {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data.hits.hits);
      setdoc(data.hits.hits)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function App() {
  let [text, settext] = useState()
  let [doc, setdoc] = useState([])
  let [highlighttext, sethighlighttext] = useState()
  return (
    <div className="form-inline">
      <input className="form-control" onChange={(e) => settext(e.target.value)} type="text" placeholder="Search.."></input>
      <button className="btn btn-primary" onClick={
        (e) => {
          Search(text, setdoc)
          Analyze(text, sethighlighttext)
        }
      }>Go</button>
      <table className="table">
        <thead>
          <tr>
            <th>id</th>
            <th>title</th>
            <th>message</th>
            <th>name</th>
            <th>tags</th>
          </tr>
        </thead>
        <tbody>
          {doc.map(r => {
            return (
              <tr key={r._source.id}>
                <td>{r._source.id}</td>
                <td><Highlighter
                  highlightStyle={{ backgroundColor: '#00ffff', padding: 0 }}
                  highlightClassName="YourHighlightClass"
                  searchWords={highlighttext}
                  autoEscape={true}
                  textToHighlight={r._source.title}
                /></td>
                <td><Highlighter
                  highlightStyle={{ backgroundColor: '#00ffff', padding: 0 }}
                  highlightClassName="YourHighlightClass"
                  searchWords={highlighttext}
                  autoEscape={true}
                  textToHighlight={r._source.message}
                /></td>
                <td><Highlighter
                  highlightStyle={{ backgroundColor: '#00ffff', padding: 0 }}
                  highlightClassName="YourHighlightClass"
                  searchWords={highlighttext}
                  autoEscape={true}
                  textToHighlight={r._source.author.name}
                /></td>
                <td>{r._source.tags.map(t => <div key={t.name}><Highlighter
                  highlightStyle={{ backgroundColor: '#00ffff', padding: 0 }}
                  highlightClassName="YourHighlightClass"
                  searchWords={highlighttext}
                  autoEscape={true}
                  textToHighlight={t.name}
                /><br /></div>)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}
export default App;