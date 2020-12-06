use scoopit_api::types::*;
use serde::Serialize;

#[derive(Serialize)]
pub struct TopicJsonOutput {
    name: String,
    short_name: String,
    description: Option<String>,
    post_count: u64,
    image_url: String,
    url: String,
    creator: UserJsonOutput,
    posts: Vec<PostJsonOutput>,
}

#[derive(Serialize)]
pub struct PostJsonOutput {
    title: String,
    html_content: String,
    html_fragment: Option<String>,
    html_insight: Option<String>,
    scoop_url: String,
    url: Option<String>,
    image_url: Option<String>,
}
#[derive(Serialize)]
pub struct UserJsonOutput {
    name: String,
    short_name: String,
    url: String,
    bio: Option<String>,
    avatar_url: String,
}

impl From<Topic> for TopicJsonOutput {
    fn from(t: Topic) -> Self {
        Self {
            name: t.name,
            short_name: t.short_name,
            description: t.description,
            post_count: t.curated_post_count,
            image_url: t.large_image_url,
            url: t.url,
            creator: t.creator.unwrap().into(),
            posts: t
                .curated_posts
                .into_iter()
                .into_iter()
                .flatten()
                .map(|p| p.into())
                .collect(),
        }
    }
}

impl From<Post> for PostJsonOutput {
    fn from(p: Post) -> Self {
        Self {
            title: p.title,
            html_content: p.html_content,
            html_fragment: p.html_fragment,
            html_insight: p.html_insight,
            scoop_url: p.scoop_url,
            url: p.url,
            image_url: p.large_image_url,
        }
    }
}

impl From<Box<User>> for UserJsonOutput {
    fn from(u: Box<User>) -> Self {
        Self {
            name: u.name,
            short_name: u.short_name,
            url: u.url,
            bio: u.bio,
            avatar_url: u.large_avatar_url,
        }
    }
}
impl From<User> for UserJsonOutput {
    fn from(u: User) -> Self {
        Self {
            name: u.name,
            short_name: u.short_name,
            url: u.url,
            bio: u.bio,
            avatar_url: u.large_avatar_url,
        }
    }
}

#[derive(Serialize)]
pub struct SearchJsonOutput {
    users: Option<Vec<UserJsonOutput>>,
    topics: Option<Vec<TopicJsonOutput>>,
    posts: Option<Vec<PostJsonOutput>>,
    total_found: i32,
}

impl From<SearchResults> for SearchJsonOutput {
    fn from(s: SearchResults) -> Self {
        let SearchResults {
            posts,
            topics,
            users,
            total_found,
        } = s;

        Self {
            users: users.map(|users| users.into_iter().map(|user| user.into()).collect()),
            topics: topics.map(|topics| topics.into_iter().map(|topic| topic.into()).collect()),
            posts: posts.map(|posts| posts.into_iter().map(|post| post.into()).collect()),
            total_found,
        }
    }
}
