import React, { useEffect } from 'react';
import { merge, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Link, useParams } from 'react-router-dom';
import { Store, createAsyncAction, errorResult, successResult } from "pullstate";
import { history } from './history';

// compute search query from current history
function getInitialSearchQuery() {
    const loc = history.location;
    if (loc.pathname.startsWith("/search/")) {
        return decodeURIComponent(loc.pathname.substring(8))
    } else {
        return "";
    }
}

// global search store: only keep the current state if the input so it is reminded during navigation accross pages
const SearchStore = new Store({
    // maps search init
    liveSearchQuery: getInitialSearchQuery(),
});

// Search for some topics...
const searchAction = createAsyncAction(async ({ query }) => {
    if (query == null || query === "") {
        return successResult(null)
    }
    console.log("Searching: " + query)
    const response = await fetch("/api/search/topic/" + query)
    if (response.ok) {
        return successResult(await response.json());
    } else {
        return errorResult([], `An error occured during search for: ${query}`);
    }
}, {
    postActionHook: ({ result }) => {
        if (!result.error) {
            SearchStore.update(s => {
                s.searchResults = result.payload;
                s.loading = false;
            });
        }
    }
});

// Debounce search field input and go to /search/{query} page
const searchQuery$ = new Subject();
searchQuery$.subscribe(query => SearchStore.update(function (state) {
    state.liveSearchQuery = query;
}));
const searchQueryClicked$ = new Subject();
const debounced$ = searchQuery$.pipe(debounceTime(500));
// forward query to url
merge(debounced$, searchQueryClicked$).subscribe(q => {
    // always re-run the search
    searchAction.clearCache({ query: q });
    history.push("/search/" + encodeURIComponent(q))
});

const useSearchResults = (query) => {
    const [finished, result] = searchAction.useBeckon({ query });
    return {
        finished: finished,
        error: result.error,
        payload: result.payload
    }
}

export const Search = () => {
    let { searchQuery } = useParams();
    let liveSearchQuery = SearchStore.useState(s => s.liveSearchQuery);
    let isLoading;
    if (history.location.pathname.startsWith("/search")) {
        // we are on the search page
        // eslint-disable-next-line react-hooks/rules-of-hooks
        isLoading = !useSearchResults(searchQuery).finished;
    } else {
        isLoading = false;
    }

    const buttonClasses = isLoading ? "bg-gray-400" : "hover:bg-lime-700  bg-lime-600 cursor-pointer"

    return <div class="p-4 bg-white shadow-sm">
        Search for a topic:
            <div class="flex max-w-md">
            <input type="text" placeholder="Enter some text here"
                class="flex-grow p-1 border border-lime-300 focus:border-lime-600 focus:outline-none rounded-sm"
                value={liveSearchQuery}
                onChange={(e) => {
                    // send value to our rxjs subject
                    searchQuery$.next(e.target.value);
                }}
            />
            <div class={"pt-1 pb-1 pl-3 pr-3 shadow-sm  border-lime:600 transition-colors border rounded inline-block text-white uppercase " + buttonClasses}
                onClick={() => searchQueryClicked$.next(liveSearchQuery)}
            >
                {isLoading ? "Searching" : "Search"}
            </div>
        </div>
    </div>
}

export const SearchResults = () => {
    let { searchQuery } = useParams();
    const { finished, payload } = useSearchResults(searchQuery);
    if (!finished) {
        return <div>Loading...</div>;
    } else if (payload == null) {
        // search field empty
        return null;
    } else if (payload.topics && payload.topics.length > 0) {
        return <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {payload.topics.map((topic, i) => <SearchedTopic {...topic} key={i} />)}
        </div>;
    } else if (finished) {
        // search performed but no results
        return <div class="p-4 bg-white shadow-md">
            No results found...
        </div>
    }
}

export const SearchedTopic = ({ name, short_name, description, post_count, image_url }) => {
    return <div class="bg-white flex shadow-md h-20">
        <div class="h-20 w-20 bg-cover flex-shrink-0"
            style={{ backgroundImage: "url('" + image_url + "')" }}
        ></div>
        <div class="m-4 overflow-hidden">
            <div class="text-xl whitespace-nowrap overflow-ellipsis"><Link className="text-black" to={"/topic/" + short_name}>{name}</Link></div>
            <div class="text-sm" dangerouslySetInnerHTML={{ __html: description }} />
        </div>
    </div>
}
