import React from 'react';
import { useParams } from 'react-router-dom';
import {
    useRecoilValue,
    selectorFamily,
} from 'recoil';
import { format } from "date-fns";

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

export const TopicHeader = ({ image_url, name, description, url }) => (
    <div class="bg-white shadow-md flex max-h-32 md:max-h-40">
        <div class="h-32 w-32 md:h-40 md:w-40 bg-cover flex-shrink-0"
            style={{ backgroundImage: "url('" + image_url + "')" }}
        />
        <div class="p-4 flex flex-col">
            <h1 class="text-xl md:text-2xl">{name}</h1>
            <div class="flex-grow overflow-hidden" dangerouslySetInnerHTML={{ __html: description }}>

            </div>
            <div class="text-sm">
                <a href={url}>View it on Scoop.it</a>
            </div>
        </div>
    </div>
)

export const Topic = () => {
    let { urlName } = useParams();
    const topic = useRecoilValue(topicData(urlName));
    if (topic == null) {
        return <div style={{ color: "red" }}>Topic not found</div>
    }
    return <div className="p-4 max-w-screen-lg mx-auto">
        <TopicHeader {...topic} />
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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

const PostHeader = ({ author, curation_date }) => (
    <div class="flex items-center justify-between p-4 border-b ">
        <div class="flex items-center">
            <img class="w-8 rounded-full mr-2" src={author.small_avatar_url} alt={author.name} />
            <div>{author.name}</div>
        </div>
        <div class="text-xs ">{format(new Date(curation_date), "dd MMM yyyy, HH:mm")}</div>
    </div>
);

const Post = ({ title, html_content, html_fragment, url, image_url, html_insight, scoop_url, curation_date, author }) => {
    return <div class="mb-4 bg-white rounded-sm shadow-md flex flex-col">
        <PostHeader author={author} curation_date={curation_date} />
        <div class="p-4">
            <div class="text-xl mb-2">
                <a href={url} class="text-black" target="blank">{title}</a>
            </div>
            <div>
                <img src={image_url} class="w-full" alt={title} />
            </div>
            <div class="mt-1 flex-grow overflow-ellipsis overflow-hidden"
                dangerouslySetInnerHTML={{ __html: html_content }}></div>
            <Insight html_insight={html_insight} />

            <ViewOriginal url={url} />
        </div>
    </div>
}
