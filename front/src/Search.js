import React, { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { atom, useRecoilState } from 'recoil';
import { merge, of, Subject } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Link } from 'react-router-dom';

const searchQuery$ = new Subject();
const searchQueryClicked$ = new Subject();

const searchInputValue = atom({
    key: "search/inputValue",
    default: "",
});

// the search results
const searchResult = atom({
    key: "search/results",
    default: null,
})

const loading = atom({
    key: "search/results/loading",
    default: false,
})

export const Search = () => {
    // handle debouncing and fetching.
    // results are stored in a recoil state
    const setSearchResults = useSetRecoilState(searchResult);
    const setLoading = useSetRecoilState(loading);
    useEffect(() => {
        // set value of input state
        const debounced$ = searchQuery$.pipe(debounceTime(500));

        const sub = merge(debounced$, searchQueryClicked$).pipe(
            switchMap(q => {
                if (q === "") {
                    return of(null);
                } else {
                    setLoading(true) // not sure its appropriate to do this here
                    return ajax.getJSON("/api/search/topic/" + encodeURIComponent(q))
                        .pipe(catchError(error => {
                            console.log('error: ', error);
                            return of(error);
                        }))
                }
            }),
        ).subscribe(results => {
            setSearchResults(results)
            setLoading(false);
        });
        return () => {
            sub.unsubscribe();
        }
    }, [setSearchResults, setLoading])
    return <SearchField />
};

const SearchField = () => {
    let [value, setValue] = useRecoilState(searchInputValue);
    let isLoading = useRecoilValue(loading);

    const buttonClasses = isLoading ? "bg-gray-400" : "hover:bg-lime-700  bg-lime-600 cursor-pointer"

    return <div class="p-4 bg-white shadow-sm">
        Or search for one:
            <div class="flex max-w-md">
            <input type="text" placeholder="Enter some text here"
                class="flex-grow p-1 border border-lime-300 focus:border-lime-600 focus:outline-none rounded-sm"
                value={value}
                onChange={(e) => {
                    const value = e.target.value;
                    // set value in recoil state
                    setValue(value)
                    // send value to our rxjs subject
                    searchQuery$.next(value);
                }}
            />
            <div class={"pt-1 pb-1 pl-3 pr-3 shadow-sm  border-lime:600 transition-colors border rounded inline-block text-white uppercase " + buttonClasses}
                onClick={() => searchQueryClicked$.next(value)}
            >
                {isLoading ? "Searching" : "Search"}
            </div>
        </div>
    </div>
}

export const SearchResults = () => {
    const results = useRecoilValue(searchResult);
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
