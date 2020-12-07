import { Route, BrowserRouter as Router, Link } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { Topic } from './Topic';
import React from 'react';
import { Search, SearchResults } from './Search';

function App() {
  return (
    <RecoilRoot>
      <Router>
        <div class="p-4 text-lg">
          <Link to="/" class="text-black">Scoop.it API demo</Link>
        </div>
        <Route path="/" exact>
          <div class="p-4 bg-white shadow-sm mb-4">
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
          <div class="mb-4">
            <Search />
          </div>
          <div>
            <SearchResults />
          </div>
        </Route>
        <Route path="/topic/:urlName">
          <React.Suspense fallback={<div>Loading...</div>}>
            <Topic />
          </React.Suspense>
        </Route>
      </Router>


    </RecoilRoot>
  );
}

export default App;
