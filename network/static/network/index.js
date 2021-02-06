document.addEventListener('DOMContentLoaded', function() {      
    //Load content for authenticated user
    if (document.querySelector('#profile-link')) {
      document.querySelector('#following-link').addEventListener('click', following);
      const userid = document.querySelector('#profile-link').dataset.userid;
      document.querySelector('#profile-link').addEventListener('click', () => profile(userid));
      document.querySelector('#post-form').onsubmit = create_post;
      document.querySelector('#post-textarea').value = ''; 
    }  
    document.querySelector('#posts-link').addEventListener('click', () => allposts(1));
    /* document.querySelector('#previous').style.display = 'none'; */

   // By default load all  posts
    allposts(1);
});


// Creare new post
function create_post() {
  textarea = document.querySelector('#post-textarea').value;
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
      allposts();
    });
  } else {
    alert('Please add text to your post');
  }  
  return false;  
} 


function compose_post(post_id, user_id, author, text, timestamp, count_likes, likes, appended_to_selector) {
  
  const div = document.createElement('div');
  div.id = "post-" + post_id;
  div.className = "posts-row";
  div.innerHTML = `<div class="author-username" onclick="profile(${user_id})"><strong>${author}</strong></div><div id="post-text-${post_id}" contenteditable="false">${text}</div><div>${timestamp}</div>`;

  // Create EDIT button 
  const button = document.createElement('button');
  button.id = "edit-" + post_id;
  button.className = 'btn btn-link edit-btn';
  button.innerHTML = 'Edit post';
  button.addEventListener('click', () => post_edit(post_id));

  // Add LIKE button
  like = document.createElement('div');
  like.innerHTML = `<button id="like-btn-${post_id}" class='like-toggle'>♥</button><span id="like-cnt-${post_id}" class='counter'>${count_likes}</span>`;
  like.className = 'post-like';    


  post_is_liked = false;
  // Color LIKE button if post was liked by user
  if (document.querySelector('#profile-link')) {
    current_user_id = Number(document.querySelector('#profile-link').dataset.userid);
    if (likes.includes(current_user_id)) {
      like.innerHTML = `<button id="like-btn-${post_id}" class='like-toggle like-active'>♥</button><span id="like-cnt-${post_id}" class='counter'>${count_likes}</span>`;
      post_is_liked = true;      
    }
  }    

  like.addEventListener('click', () => post_like(post_id, post_is_liked));
  div.append(like); 

  // Add EDIT button  if user is author of this post
  if (document.querySelector('#profile-link') && user_id == document.querySelector('#profile-link').dataset.userid) {
    div.append(button);  
  }  

  document.querySelector(appended_to_selector).append(div);  
  
}


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



// Set vision of Edit button if current user is author of the post
function editBtnVision(post_author) {
  const edit_btn = document.querySelectorAll('.edit-btn');

  if (document.querySelector('#profile-link')) {
    const current_user = document.querySelector('#profile-link').dataset.userid;
    if (current_user == post_author) {
          for (let i = 0; i < edit_btn.length; i += 1) {
          edit_btn[i].style.display = 'block';
        }
    }
  }
}


// Follow user
function follow() {
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
    document.querySelector(".followbtn").innerText = 'Unfollow';    
  });  
  return false;  
} 


// Edit post
function post_edit(post_id) {  
  const text_selector = "#post-text-" + post_id;
  const button_selector = "#edit-" + post_id;
  const all_post_selector = "#post-" + post_id;
  document.querySelector(text_selector).contentEditable = "true";
  document.querySelector(button_selector).style.display = 'none';
  
  const button = document.createElement('button');
  button.id = "save-post-" + post_id;
  button.className = "btn btn-link";
  button.innerHTML = 'Save edited post';
  button.addEventListener('click', () => save_edit(post_id));
  document.querySelector(all_post_selector).append(button);
  return document.querySelector(text_selector).focus();
}

// Publish edited post
function save_edit(post_id) {
  const text_selector = "#post-text-" + post_id;
  url = '/edit/' + post_id;
  fetch(url, {
    method: 'PUT',
    body: JSON.stringify({
      text: document.querySelector(text_selector).innerHTML
    })
  })
  .then(response => {
    response.json();
  })
  .then(result => {
    console.log(result)
    if (document.querySelector('#profile-name')) {
      user = document.querySelector('#profile-name').dataset.user;
      profile(user);
    } else {
      allposts();
    }
  });
  // Prevent default submission
  return false; 
}


function post_like(post_id, post_is_liked) {
  const button_selector = "#like-btn-" + post_id; 
  const counter_selector = "#like-cnt-" + post_id;
  const counter = Number(document.querySelector(counter_selector).innerHTML);  

  url = '/like/' + post_id;
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
    if (post_is_liked === true) {
      document.querySelector(counter_selector).innerHTML = counter - 1;
      document.querySelector(button_selector).classList.toggle('like-toggle');
    } else {
      document.querySelector(counter_selector).innerHTML = counter + 1;
      document.querySelector(button_selector).classList.toggle('like-active');
    }
    allposts();
  });
  // Prevent default submission
  return false;  
}