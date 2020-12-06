import React from 'react';
import { useParams } from 'react-router-dom';
import {
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    selectorFamily,
} from 'recoil';

const topicData = selectorFamily({
    key: 'topicData',
    get: urlName => async ({ get }) => {
        const response = await fetch("/api/topic/" + urlName)
        if (response.ok) {
            return response.json();
        } else {
            return null;
        }
    }
})

export const Topic = () => {
    let { urlName } = useParams();
    const topic = useRecoilValue(topicData(urlName));
    if (topic == null) {
        return <div style={{ color: "red" }}>Topic not found</div>
    }
    console.log(topic)
    return <div className="p-4 max-w-screen-lg mx-auto">
        <div class="bg-white p-4 mb-4 shadow-md">
            <h1>{topic.name}</h1>
            <div class="text-sm">
                <a href={topic.url}>View it on Scoop.it</a>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:hidden">{topic.posts.map((post, i) => (<Post key={i} {...post} />))}</div>
            <div class="hidden md:block">{topic.posts.map((post, i) => i % 2 === 0 && (<Post key={i} {...post} />))}</div>
            <div class="hidden md:block">{topic.posts.map((post, i) => i % 2 === 1 && (<Post key={i} {...post} />))}</div>
        </div>
    </div>
}

const domain = (url) => {
    if (!url) {
        return null;
    }
    const u = new URL(url);
    return u.host;
}


const Insight = ({ html_insight }) => html_insight &&
    <div class="mt-1 rounded-sm shadow-md bg-gray-100 p-2"
    >
        <div>Curator's insight:</div>
        <div class="italic overflow-ellipsis overflow-hidden" dangerouslySetInnerHTML={{ __html: html_insight }} />
    </div>;

const ViewOriginal = ({ url }) => {
    if (!url) {
        return null;
    }
    return <div class='mt-2 text-sm text-right'>
        <a href={url} target="blank">View original on {domain(url)}</a>
    </div>
}
const Post = ({ title, html_content, html_fragment, url, image_url, html_insight, scoop_url }) => {
    return <div class="p-4 mb-4 bg-white rounded-sm shadow-md flex flex-col">
        <div class="text-xl">
            <a href={url} class="text-black" target="blank">{title}</a>
        </div>
        <div>
            <img src={image_url} class="w-full" />
        </div>
        <div class="mt-1 flex-grow overflow-ellipsis overflow-hidden"
            dangerouslySetInnerHTML={{ __html: html_content }}></div>
        <Insight html_insight={html_insight} />
        <ViewOriginal url={url} />
    </div>
}
