import { Route, Router, Link } from 'react-router-dom';
import { Topic } from './Topic';
import React from 'react';
import { Search, SearchResults } from './Search';
import { history } from './history';

function App() {
  return (
    <Router history={history} >
      <div className="p-4 text-lg">
        <Link to="/" className="text-black">Scoop.it API demo</Link>
      </div>
      <Route path="/" exact>
        <div className="p-4 bg-white shadow-sm mb-4">
          Please choose a topic:
          <ul>
            <li>
              <Link to="/topic/corona-virus-news">Corona Virus News</Link>
            </li>
            <li>
              <Link to="/topic/vallee-d-aure">Vallée d'Aure</Link>
            </li>
            <li>
              <Link to="/topic/best-of-photojournalism">Best of Photojournalism</Link>
            </li>
          </ul>
        </div>
        <Search />
      </Route>
      <Route path="/search/:searchQuery?">
        <div className="mb-4">
          <Search />
        </div>
        <div className="relative">
          <SearchResults />
        </div>
      </Route>
      <Route path="/topic/:urlName">
        <Topic />
      </Route>
    </Router>
  );
}

export default App;
