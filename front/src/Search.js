import React from 'react';
import { merge, of, Subject } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Link } from 'react-router-dom';
import { Store } from "pullstate";
import { history } from './history';

const SearchStore = new Store({
    // maps search inpit
    liveSearchQuery: "",
    // searchQuery actually being searched for
    searchQuery: null,
    searchResults: null,
    loading: false,
});

const searchQuery$ = new Subject();

// store.liveSearchQueryr is direcly plugged on the rxjs subject
searchQuery$.subscribe(query => SearchStore.update(function (state) {
    state.liveSearchQuery = query;
}));

const searchQueryClicked$ = new Subject();

const debounced$ = searchQuery$.pipe(debounceTime(500));

// receive search queries!!
const doSearch$ = new Subject();
doSearch$.pipe(
    switchMap(q => {
        if (q === "") {
            return of(null);
        } else {
            SearchStore.update(s => {
                s.loading = true;
            })
            return ajax.getJSON("/api/search/topic/" + encodeURIComponent(q))
                .pipe(catchError(error => {
                    console.log('error: ', error);
                    return of(error);
                }))
        }
    })
).subscribe(results => {
    SearchStore.update(s => {
        s.searchResults = results;
        s.loading = false;
    })
});

// forward query to url
merge(debounced$, searchQueryClicked$).subscribe(q => {
    history.push("/search/" + encodeURIComponent(q))
});

const handleSearchUrl = location => {
    if (location.pathname.startsWith("/search/")) {
        const query = decodeURIComponent(location.pathname.substring(8));
        doSearch$.next(query);
    }
}
// forward url changes to doSearch$
history.listen(handleSearchUrl);
// also call this immediately
handleSearchUrl(history.location)

export const Search = () => {
    let liveSearchQuery = SearchStore.useState(s => s.liveSearchQuery);
    let isLoading = SearchStore.useState(s => s.loading);

    const buttonClasses = isLoading ? "bg-gray-400" : "hover:bg-lime-700  bg-lime-600 cursor-pointer"

    return <div class="p-4 bg-white shadow-sm">
        Search for a topic:
            <div class="flex max-w-md">
            <input type="text" placeholder="Enter some text here"
                class="flex-grow p-1 border border-lime-300 focus:border-lime-600 focus:outline-none rounded-sm"
                value={liveSearchQuery}
                onChange={(e) => {
                    const newValue = e.target.value;
                    // send value to our rxjs subject
                    searchQuery$.next(newValue);
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
    const results = SearchStore.useState(s => s.searchResults);
    console.log(results)
    if (results && results.topics && results.topics.length > 0) {
        return <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.topics.map((topic, i) => <SearchedTopic {...topic} key={i} />)}
        </div>;
    } else if (results != null) {
        // search performed but no results
        return <div class="p-4 bg-white shadow-md">
            No results found...
        </div>
    } else {
        return null;
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
