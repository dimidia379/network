
// Свести все в две функции: вывод постов и профайл(с выводом постов в нем)










// All posts
function allposts(pagen) {
    // Show the all-posts-view and hide other views 
    document.querySelector('#all-posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#following-view').style.display = 'none';
    document.querySelector('#all-posts-view').innerHTML = `<h1>All Posts</h1>`;
    document.querySelector('.pagination').innerHTML = '';  
  
    // Show textarea for new post if user is authenticated
    if (document.querySelector('#profile-link')) {
      document.querySelector('#new_post_view').style.display = 'block';
      document.querySelector('#post-textarea').value = '';
    } else {
      document.querySelector('#new_post_view').style.display = 'none';
    }    
  
    // Get posts list
    url = '/posts/page/' + pagen;
    fetch(url)
    .then(response => response.json())
     .then(answer => {
        console.log(answer);
        const posts = answer.posts;
        const number_of_pages = answer.number_of_pages;
        posts.forEach(post => {
          const post_id = post["id"];
          const author = post["author"];
          const text = post["text"];
          const timestamp = post["timestamp"];
          const user_id = post["author_id"];
          const count_likes = post["count_likes"];
          const likes = post["likes"];
          const appended_to_selector = '#all-posts-view';
          compose_post(post_id, user_id, author, text, timestamp, count_likes, likes, appended_to_selector);
        })
        pagination(pagen, number_of_pages);    
    });
    // Prevent default submission
    return false; 
  }
  
  
  // Add page navigation buttons
  function pagination(pagen, number_of_pages) {
    previous = document.createElement("button");
    previous.innerHTML = "Previous";
    previous.addEventListener("click", () => allposts(pagen - 1));  
  
    next = document.createElement("button");
    next.innerHTML = "Next";
    next.addEventListener("click", () => allposts(pagen + 1));
  
    if (pagen > 0 && pagen < number_of_pages) {
      document.querySelector(".pagination").append(next);
    } 
    if (pagen > 1 && pagen <= number_of_pages) {
      document.querySelector(".pagination").append(previous);
    }
  }
  
  
  // Following list
  function following() {
    // Show the following and hide other views  
    document.querySelector('#new_post_view').style.display = 'none';
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#following-view').style.display = 'block';
    document.querySelector('#following-view').innerHTML = '<strong>Following</strong>';
    
    // Posts list
    fetch('/following')
    .then(response => response.json())
    .then(posts => {
      console.log(posts);
      posts.forEach(post => {
        const post_id = post["id"];
        const author = post["author"];
        const text = post["text"];
        const timestamp = post["timestamp"];
        const user_id = post["author_id"];
        const count_likes = post["count_likes"];
        const likes = post["likes"];
        const appended_to_selector = '#following-view';
        compose_post(post_id, user_id, author, text, timestamp, count_likes, likes, appended_to_selector);
      })  
    });  
    // Prevent default submission
    return false;  
  }
        
  
  
  function profile(nekto) {   
    //Show profile view and hide other views
    document.querySelector('#new_post_view').style.display = 'none';
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#following-view').style.display = 'none';
    document.querySelector('#profile-view').style.display = 'block';
  
    document.querySelector('#user-info').innerHTML = '';
    document.querySelector('#user-posts').innerHTML = '';      
  
    // Get information about following and followers
    url_user = "/profile/" + nekto;
    fetch(url_user)
    .then(response => response.json())
    .then(follow => {
      console.log(follow);
      console.log(nekto);
      const name = follow["name"];
      const following = follow["following"];
      const followers = follow["followers"]; 
      const is_followed = follow["is_followed"];
  
      const div = document.createElement('div');
      div.innerHTML = `<div data-user="${nekto}" id="profile-name">${name}</div><div>Following: ${following}</div><div>Followers: ${followers}</div>`;
  
      // Add FOLLOW button
      const button = document.createElement('button');
      button.id = 'follow-btn';
      
      document.querySelector('#user-info').append(div);    
    
      if (document.querySelector('#profile-link')) {
        document.querySelector('#user-info').append(button);
        button.addEventListener('click', follow);
        
        // Rename FOLLOW button if user already followed
        if (is_followed == true) {
            button.innerHTML = 'Unfollow';
          };
  
        //Hide FOLLOW button if user in his own profile
        const current_user = document.querySelector('#profile-link').dataset.userid;
        if (current_user == nekto) {
          button.style.display = 'none';
        };
      }              
    });  
  
    // Get user's posts
    url_posts = "/posts/" + nekto;
    fetch(url_posts)
    .then(response => response.json())
    .then(posts => {
      console.log(posts);
      posts.forEach(post => {
        const post_id = post["id"];
        const text = post["text"];
        const likes = post["likes"];
        const author = post["author"];
        const timestamp = post["timestamp"];
        const user_id = post["author_id"];    
        const count_likes = post["count_likes"];  
        const appended_to_selector = '#user-posts';
        compose_post(post_id, user_id, author, text, timestamp, count_likes, likes, appended_to_selector);
      })
    });
  // Prevent default submission
    return false;  
  }
  