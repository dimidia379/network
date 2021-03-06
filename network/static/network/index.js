document.addEventListener('DOMContentLoaded', function() {      
    //Load content for authenticated user
    if (document.querySelector('#profile-link')) {
      document.querySelector('#following-link').addEventListener('click', () => following(1));
      const userID = document.querySelector('#profile-link').dataset.userid;
      document.querySelector('#profile-link').addEventListener('click', () => profile(userID, 1));
      document.querySelector('#post-form').onsubmit = createPost;
      document.querySelector('#post-textarea').value = ''; 
    }  
    document.querySelector('#posts-link').addEventListener('click', () => allPosts(1));

   // By default load all  posts
    allPosts(1);
});


// Compose post
function composePost(post_id, user_id, author, text, timestamp, count_likes, likes, appended_to_selector) {
  
  const div = document.createElement('div');
  div.id = "post-" + post_id;
  div.className = "posts-row";
  div.innerHTML = `<div class="author-username" onclick="profile(${user_id}, 1)"><strong>${author}</strong></div> \ 
                   <div id="post-text-${post_id}" class="text-post">${text}</div><div class="post-date">${timestamp}</div>`;

  // Create EDIT button 
  const button = document.createElement('button');
  button.id = "edit-" + post_id;
  button.className = 'btn btn-link edit-btn';
  button.innerHTML = 'Edit post';
  button.addEventListener('click', () => postEdit(post_id, text));

  // Add LIKE button
  const like = document.createElement('div');
  like.innerHTML = `<button id="like-btn-${post_id}" class='like-toggle' data-author="${user_id}">♥</button> \
                    <span id="like-cnt-${post_id}" class='counter'>${count_likes}</span>`;
  like.className = 'post-like';    


  let postIsLiked = false;
  // Color LIKE button if post was liked by user
  if (document.querySelector('#profile-link')) {
    const currentUserId = Number(document.querySelector('#profile-link').dataset.userid);
    if (likes.includes(currentUserId)) {
      like.innerHTML = `<button id="like-btn-${post_id}" class='like-toggle like-active' data-author="${user_id}">♥</button> \
                        <span id="like-cnt-${post_id}" class='counter'>${count_likes}</span>`;
      postIsLiked = true;      
    }
  }    

  like.addEventListener('click', () => postLike(post_id, postIsLiked));
  div.append(like); 

  // Add EDIT button  if user is author of this post
  if (document.querySelector('#profile-link') && user_id == document.querySelector('#profile-link').dataset.userid) {
    div.append(button);  
  }  
  document.querySelector(appended_to_selector).append(div);    
}


// Add page navigation buttons
function pagination(area, pagen, numberOfPages) {
  const previous = document.createElement("button");
  const next = document.createElement("button");
  previous.innerHTML = "Previous";  
  next.innerHTML = "Next";
  next.className = "btn btn-primary";
  previous.className = "btn btn-primary";
  
  if (area == "all_posts") {
    previous.addEventListener("click", () => allPosts(pagen - 1));
    next.addEventListener("click", () => allPosts(pagen + 1));
    
  } else if (area == "following") {
    previous.addEventListener("click", () => following(pagen - 1));
    next.addEventListener("click", () => following(pagen + 1));
    
  } else {
    const userID = Number(area);
    previous.addEventListener("click", () => profile(userID, pagen - 1));
    next.addEventListener("click", () => profile(userID, pagen + 1));    
  }    
  
  if (pagen > 0 && pagen < numberOfPages) {
    document.querySelector(".pagination").append(next);    
  } 
  if (pagen > 1 && pagen <= numberOfPages) {
    document.querySelector(".pagination").append(previous);    
  }
}


 // Add posts and pagination
 function getPosts(area, pageNum) {
  document.querySelector("#pageNumber").setAttribute("currentPage", pageNum);
  document.querySelector("#pageNumber").setAttribute("currentArea", area);
  const url = `/posts/${area}/${pageNum}`;
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
          let appended_to_selector = '';

          if (area == "all_posts") {
            appended_to_selector = '#all-posts-view';
          } else if (area == "following") {
            appended_to_selector = '#following-view';
          } else {
            appended_to_selector = '#user-posts';
          }          

          composePost(post_id, user_id, author, text, timestamp, count_likes, likes, appended_to_selector);           
      })         
      pagination(area, pageNum, number_of_pages);    
});
}


// All posts view
function allPosts(pagen) {
  // Show the all-posts-view and hide other views 
  document.querySelector('#all-posts-view').style.display = 'block';
  document.querySelector('#profile-view').style.display = 'none';
  document.querySelector('#following-view').style.display = 'none';
  document.querySelector('#all-posts-view').innerHTML = `<h1>All Posts</h1>`;
  document.querySelector(".pagination").innerHTML = '';
  
  
  // Show textarea for new post if user is authenticated
  if (document.querySelector('#profile-link')) {
    document.querySelector('#new_post_view').style.display = 'block';
    document.querySelector('#post-textarea').value = '';
  } else {
    document.querySelector('#new_post_view').style.display = 'none';
  }    

  // Get all posts list  
  getPosts('all_posts', pagen);
  // Prevent default submission
  return false; 
}
  

// Following view
function following(pagen) {
  // Show the following and hide other views  
  document.querySelector('#new_post_view').style.display = 'none';
  document.querySelector('#all-posts-view').style.display = 'none';
  document.querySelector('#profile-view').style.display = 'none';
  document.querySelector('#following-view').style.display = 'block';
  document.querySelector(".pagination").innerHTML = '';
  document.querySelector('#following-view').innerHTML = '<h2>Following</h2>';
  
  // Get posts list
  getPosts('following', pagen);
  // Prevent default submission
  return false;  
}
        

function profile(profileID, pagen) {   
  //Show profile view and hide other views
  document.querySelector('#new_post_view').style.display = 'none';
  document.querySelector('#all-posts-view').style.display = 'none';
  document.querySelector('#following-view').style.display = 'none';
  document.querySelector('#profile-view').style.display = 'block';

  document.querySelector('#user-info').innerHTML = '';
  document.querySelector('#user-posts').innerHTML = '';
  document.querySelector(".pagination").innerHTML = '';      

  // Get information about following and followers
  const url_user = "/profile/" + profileID;
  fetch(url_user)
  .then(response => response.json())
  .then(follow => {
    console.log(follow);
    const name = follow["name"];
    const following = follow["following"];
    const followers = follow["followers"]; 
    const is_followed = follow["is_followed"];

    const div = document.createElement('div');
    div.innerHTML = `<div data-user="${profileID}" id="profile-name">${name}</div> \
                     <div>Following: ${following}</div><div>Followers: ${followers}</div>`;

    // Create FOLLOW button
    const button = document.createElement('button');
    button.id = 'follow-btn';
    button.className = "btn btn-primary";
    button.innerHTML = "Follow";
    button.addEventListener('click', followUser);
    
    document.querySelector('#user-info').append(div);    
    
    // Append FOLLOW button
    if (document.querySelector('#profile-link')) {      
      document.querySelector('#user-info').append(button);
            
      // Rename FOLLOW button if user already followed
      if (is_followed) {
          button.innerHTML = 'Unfollow';
        };

      //Hide FOLLOW button if user in his own profile
      const current_user = document.querySelector('#profile-link').dataset.userid;
      if (current_user == profileID) {
        button.style.display = 'none';
      };    
    }              
  });  
  // Get user's posts
  getPosts(profileID, pagen);
  // Prevent default submission
  return false;   
}


// Set vision of Edit button if current user is author of the post
function editBtnVision(postAuthor) {
  const editBtn = document.querySelectorAll('.edit-btn');

  if (document.querySelector('#profile-link')) {
    const currentUser = document.querySelector('#profile-link').dataset.userid;
    if (currentUser == postAuthor) {
          for (let i = 0; i < editBtn.length; i += 1) {
          editBtn[i].style.display = 'block';
        }
    }
  }
}


// Publish new post
function createPost() {
  const textarea = document.querySelector('#post-textarea').value;
  if (textarea) {
    fetch('/create', {
      method:'POST',
      body: JSON.stringify({
        text: textarea
      })
    })
    .then(response => {
      response.json();
    })
    .then(result => {
      console.log(result)
      document.querySelector('#all-posts-view').innerHTML = '';
      allPosts(1);
    });
  } else {
    alert('Please add text to your post');
  }  
  return false;  
} 

// Edit post
function postEdit(postId, text) {  
  const text_selector = "#post-text-" + postId;
  const button_selector = "#edit-" + postId;
  const all_post_selector = "#post-" + postId;
  
  document.querySelector(button_selector).style.display = 'none';
  document.querySelector(text_selector).innerHTML = `<textarea id="edit-textarea" class="form-control" >${text}</textarea>`;
  
  const button = document.createElement('button');
  button.id = "save-post-" + postId;
  button.className = "btn btn-link";
  button.innerHTML = 'Save edited post';
  button.addEventListener('click', () => saveEdit(postId));
  document.querySelector(all_post_selector).append(button);
  return document.querySelector("#edit-textarea").focus();
}


// Save edited post
function saveEdit(postId) {
  const text_selector = "#post-text-" + postId;
  t = document.querySelector("#edit-textarea").value;
  console.log(t);
  const url = '/edit/' + postId;
  fetch(url, {
    method: 'PUT',
    body: JSON.stringify({
      text: t
    })
  })
  .then(response => {
    response.json();
  })
  .then(result => {
    console.log(result)
    if (document.querySelector('#profile-name')) {
      const user = document.querySelector('#profile-name').dataset.user;
      profile(user, 1);
    } else {
      allPosts(1);
    }
  });
  // Prevent default submission
  return false; 
}


// Like or unlike post
function postLike(postID, postIsLiked) {
  if (!document.querySelector('#profile-link')) {
    alert("Please log in to like posts.")
  } else {
    const buttonSelector = `#like-btn-${postID}`;
    const counterSelector = `#like-cnt-${postID}`;
    const userID = document.querySelector(buttonSelector).dataset.author;
    const counter = Number(document.querySelector(counterSelector).innerHTML);  
    const currentPage = document.querySelector("#pageNumber").getAttribute("currentPage");
    const currentArea = document.querySelector("#pageNumber").getAttribute("currentArea");

    const url = `/like/${postID}`;
    fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        liker: document.querySelector('#profile-link').dataset.userid
      })
    })
    .then(response => {
      response.json();
    })
    .then(result => {
      console.log(result)

      if (postIsLiked === true) {
        document.querySelector(counterSelector).innerHTML = counter - 1;
        document.querySelector(buttonSelector).classList.toggle('like-toggle');
      } else {
        document.querySelector(counterSelector).innerHTML = counter + 1;
        document.querySelector(buttonSelector).classList.toggle('like-active');
      }

      if (currentArea == "all_posts") {
        allPosts(currentPage);
      } else if (currentArea == "following") {
        following(currentPage);
      } else {
        profile(userID, currentPage);
      }    
    });
  }
  // Prevent default submission
  return false;  
}


// Follow user
function followUser() {
  fetch('/follow', {
    method:'POST',
    body: JSON.stringify({
      user_id: document.querySelector('#profile-name').dataset.user
    })
  })
  .then(response => {
    response.json();    
  })
  .then(result => {
    console.log(result)
    document.querySelector("#follow-btn").innerText = 'Unfollow';
    profile(document.querySelector("#profile-name").dataset.user, 1);
  });  
  return false;  
} 