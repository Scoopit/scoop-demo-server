import React from 'react';
import { useParams } from 'react-router-dom';
import { format } from "date-fns";
import { createAsyncAction, errorResult, successResult } from "pullstate";
import { Loading } from './Loading';

const fetchTopicAction = createAsyncAction(async ({ urlName }) => {
    const response = await fetch("/api/topic/" + urlName)
    if (response.ok) {
        return successResult(await response.json());
    } else {
        return errorResult([], `An error occured during search for: ${urlName}`);
    }
});

export const TopicHeader = ({ image_url, name, description, url }) => (
    <div className="bg-white shadow-md flex max-h-32 md:max-h-40">
        <div className="h-32 w-32 md:h-40 md:w-40 bg-cover flex-shrink-0"
            style={{ backgroundImage: "url('" + image_url + "')" }}
        />
        <div className="p-4 flex flex-col">
            <h1 className="text-xl md:text-2xl">{name}</h1>
            <div className="flex-grow overflow-hidden" dangerouslySetInnerHTML={{ __html: description }}>

            </div>
            <div className="text-sm">
                <a href={url}>View it on Scoop.it</a>
            </div>
        </div>
    </div>
)

export const Topic = () => {
    let { urlName } = useParams();
    const [finished, result] = fetchTopicAction.useBeckon({ urlName });
    if (!finished) {
        return <Loading />
    }
    const topic = result.payload
    if (topic == null) {
        return <div style={{ color: "red" }}>Topic not found</div>
    }
    return <div className="p-4 max-w-screen-lg mx-auto">
        <TopicHeader {...topic} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:hidden">{topic.posts.map((post, i) => (<Post key={i} {...post} />))}</div>
            <div className="hidden md:block">{topic.posts.map((post, i) => i % 2 === 0 && (<Post key={i} {...post} />))}</div>
            <div className="hidden md:block">{topic.posts.map((post, i) => i % 2 === 1 && (<Post key={i} {...post} />))}</div>
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
    <div className="mt-1 rounded-sm shadow-md bg-gray-100 p-2"
    >
        <div>Curator's insight:</div>
        <div className="italic overflow-ellipsis overflow-hidden" dangerouslySetInnerHTML={{ __html: html_insight }} />
    </div>;

const ViewOriginal = ({ url }) => {
    if (!url) {
        return null;
    }
    return <div className='mt-2 text-sm text-right'>
        <a href={url} target="blank">View original on {domain(url)}</a>
    </div>
}

const PostHeader = ({ author, curation_date }) => (
    <div className="flex items-center justify-between p-4 border-b ">
        <div className="flex items-center">
            <img className="w-8 rounded-full mr-2" src={author.small_avatar_url} alt={author.name} />
            <div>{author.name}</div>
        </div>
        <div className="text-xs ">{format(new Date(curation_date), "dd MMM yyyy, HH:mm")}</div>
    </div>
);

const Post = ({ title, html_content, html_fragment, url, image_url, html_insight, scoop_url, curation_date, author }) => {
    return <div className="mb-4 bg-white rounded-sm shadow-md flex flex-col">
        <PostHeader author={author} curation_date={curation_date} />
        <div className="p-4">
            <div className="text-xl mb-2">
                <a href={url} className="text-black" target="blank">{title}</a>
            </div>
            <div>
                <img src={image_url} className="w-full" alt={title} />
            </div>
            <div className="mt-1 flex-grow overflow-ellipsis overflow-hidden"
                dangerouslySetInnerHTML={{ __html: html_content }}></div>
            <Insight html_insight={html_insight} />

            <ViewOriginal url={url} />
        </div>
    </div>
}
