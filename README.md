# CS554FinalProject
# Group Name  
**Ducknight**

## Members  
- **Filip Sigda** – 20013812  
- **Konstantinos Mokos** – 20014648  
- **Junran Tao** – 20030943  
- **Haolin Chen** – 20019123  
- **WeiTing Kuo** – 20025644  

---

## Getting Started

### Option 1: Using Docker (Recommended)

1. Make sure you have [Docker](https://www.docker.com/products/docker-desktop) installed on your system
2. Navigate to the project root directory
3. Run the docker-compose command:
   ```
   docker-compose up
   ```
5. Wait for all containers to start (client, server, Redis, MongoDB)
6. Access the application at http://localhost:5173

#### How to Rebuild After updating code

1. Rebuild the server and client containers:
   ```
   docker-compose build --no-cache server client
   ```
2. Restart the containers:
   ```
   docker-compose up --force-recreate --detach server client
   ```

### Option 2: Manual Setup

Make sure node.js and imagemagick is installed

#### Server Setup
1. Open a terminal in the server directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
   The server will run on http://localhost:3000

#### Client Setup
1. Open another terminal in the client directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the client:
   ```
   npm run dev
   ```
   The client will run on http://localhost:5173

---

## Conventions Showcase App  

A social media platform focused on getting people to discover conventions, showcase their art and hobbies, and engage with others.  

For **convention organizers**, the site will be a hub to:
- Publish convention details  
- Link guest profiles  
- Enhance audience engagement  
- Perform promotional work  

Each convention will have a **feed**, which includes:
- Posts from organizers  
- Updates  
- Posts made by official guests and panelists  

For **users that aren’t convention organizers**:
- Sign up to have your posts featured and tagged under conventions you are attending  
- Promote your merchandise or grow your audience  

**Other users** can:
- Post and tag conventions for hobby-specific feeds  
- Comment, like, follow, bookmark posts  
- Give out **virtual currency** to show appreciation  

---

## Course Technologies  

### TypeScript  
A strongly typed programming language built on top of JavaScript.  
- Improves code maintainability  
- Reduces misunderstandings during collaboration  

### Redis (for caching functionality)  
An in-memory key/value store/cache offering high performance.  
- Used to cache data  
- Reduces database calls  
- Decreases response time for repeated requests  

### React  
A component-based front-end framework.  
- Ideal for displaying posts in a feed-style interface  

---

## Outside Technologies  

### [ImageMagick](https://imagemagick.org/index.php)  
A library for manipulating and editing images.  
- Used for image scaling, cropping, format conversion  
- Helps make the feed more uniform and visually appealing  

### [Docker](https://www.docker.com/)  
A platform for developing and shipping applications in portable containers.  
- Provides a consistent development environment  
- Improves collaboration  
- Enables faster development and deployment  
